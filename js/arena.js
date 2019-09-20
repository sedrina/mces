function random_from_array(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function get_random_selection(array) {
    if ( array.length === 0 ) {
        return [];
    }
    return [array[Math.floor(Math.random() * array.length)]];
}

class ArenaResult {
    constructor(winner, duration) {
        this.winner = winner;
        this.duration = duration;
    }
}

class Arena {
    constructor(heroes, time_limit, time_delta) {
        this.heroes = heroes;
        this._time_delta = time_delta || 0.1;
        this._game_time = 0;
        this._max_game_time = time_limit;
        this._triggers = [];
    }

    run() {
        this._apply_passive_skills();
        this.heroes.forEach(h => this.__run_trigger(When.BattleStarted, h, h));
        while (!this._is_finished()) {
            while ( this._apply_next_action()) {}
            this._tick(this._time_delta);
        }
        let s = this._get_arena_status() || 3;
        return new ArenaResult(s, this._game_time);
    }

    _get_arena_status() {
        let t1 = this._get_alive_count(1);
        let t2 = this._get_alive_count(2);
        if ( t1 === 0 &&  t2 === 0 ) {
            return 3;
        }
        if ( t2 === 0 ) {
            return 1;
        }
        if ( t1 === 0 ) {
            return 2;
        }
        return 0;
    }

    _apply_passive_skills() {
        this.heroes.forEach(h => {
            h.passive_skills.forEach(ps => {
                this.__apply_skills_to_targets(h, ps, [h]);
            });
        });
    }

    _trace_arena() {
        console.log('Alive counts:', this._get_alive_count(1), this._get_alive_count(2), ' game time:', this._game_time);
    }

    _apply_next_action() {
        let castings = this.heroes.filter(hero => hero.casting_skill && hero.casting_skill.counter <= 0);
        let heroes = this.heroes.filter(hero => hero.isReady());
        let cast = castings.length > 0 ? castings.sort(function (a, b){return a.casting_skill.counter - b.casting_skill.counter})[0] : null;
        let hero = heroes.length > 0 ? heroes.sort(function (a, b){return b.action_power - a.action_power})[0] : null;
        if ( cast ) {
            if ( hero === null || cast.casting_skill.counter < (hero.primary_stats.attack_cd - hero.action_power) ) {
                this._apply_casting_skill(cast);
            }
            else {
                this._apply_action(hero);
            }
            return true;
        }
        else if ( hero) {
            this._apply_action(hero);
            return true;
        }
        return false;
    }

    _tick(delta) {
        this.heroes.forEach(h => h.tick(delta));
        this._triggers.forEach(t => {
            t.duration -= delta;
            t._period_counter -= delta;
        });
        this._triggers = this._triggers.filter(t => t.duration > 0);
        this._game_time += delta;
    }

    _apply_casting_skill(hero) {
        let tmp = hero.casting_skill;
        hero.casting_skill = null;
        this._apply_skill(hero, tmp.skill, true);
        // do actions for casting skill
    }

    _apply_action(hero) {
        this.__run_trigger(When.TurnStarted, hero);
        hero.resetActionPower();
        let skills = hero.getAvaliableSkills();
        // TODO what about block mimi??
        let skill = skills.length === 0 ? hero.getBasicAttackSkill() : random_from_array(skills);
        this._apply_skill(hero, skill);
    }

    _apply_skill(hero, skill, it_is_casted=false) {
        if ( skill.needsChannel() && it_is_casted===false) {
            hero.startCasting(skill);
            return;
        }

        skill.goCooldown();

        if ( skill.target_type === TargetType.AllEnemies ) {
            this.__apply_skills_to_targets(hero, skill, this._get_multi_targetable_enemies(hero));
            return;
        }

        if ( skill.target_type === TargetType.OneEnemy ) {
            this.__apply_skills_to_targets(hero, skill, get_random_selection(this._get_single_targetable_enemies(hero)));
            return;
        }

        if ( skill.target_type === TargetType.Self ) {
            this.__apply_skills_to_targets(hero, skill, [hero]);
            return;
        }

        if ( skill.target_type === TargetType.OneAlly ) {
            this.__apply_skills_to_targets(hero, skill, get_random_selection(this._get_targetable_allies(hero)));
            return;
        }

        if ( skill.target_type === TargetType.Allies ) {
            this.__apply_skills_to_targets(hero, skill, this._get_targetable_allies(hero));
        }

        throw 'Invalid target type';
    }

    __apply_skills_to_targets(caster, skill, targets ) {
        targets.forEach(target => {
            if ( !caster.isAlive() ) {
                return;
            }
            try {
                let f = new F(this, caster, target);
                skill.apply(f);
            }
            catch {}
        });
    }

    _get_single_targetable_enemies(hero) {
        const enemies = this.heroes.filter(h => h.team_id !== hero.team_id && hero.isTargetableByEnemy());
        let taunted = enemies.filter(h => h.status.taunt);
        if ( taunted.length === 0 ) {
            return enemies;
        }
        enemies.forEach(h => {
           if ( h.status.taunt === 0 && h.status.mark > 0 ) {
               taunted.push(h);
           }
        });
        return taunted;
    }

    _get_multi_targetable_enemies(hero) {
        return this.heroes.filter(h => h.team_id !== hero.team_id && hero.isTargetableByEnemy());
    }

    _get_targetable_allies() {
        return this.heroes.filter(h => h.team_id === hero.team_id && hero.isTargetableByAlly());
    }

    _get_dead_allies() {
        return this.heroes.filter(h => h.team_id === hero.team_id && !hero.isAlive());
    }

    _is_finished() {
        let status = this._get_arena_status();
        if ( status ) {
            return !!status;
        }
        return this._game_time >= this._max_game_time;
    }

    _get_alive_count(team_id) {
        let tmp = 0;
        this.heroes.forEach(h => {
            if ( h.isAlive() && h.team_id === team_id ) {
                tmp++;
            }
        });
        return tmp;
    }

    __run_trigger(when, caster, trigger_hero) {

        if ( when == When.Died ) {
            caster.effects = caster.effects.filter(e => {
                if ( e.persistent ) {
                    return true;
                }
                e.remove();
                return false;
            })
        }

        this._triggers.forEach(t => {
            if ( t.type === when && t.owner === caster &&
                t._avalible > 0 && t._period_counter <= 0 ) {
                t._avalible--;
                if ( t._period > 0 ) {
                    t._period_counter = t._period;
                }
                let f = new F(this, caster, trigger_hero);
                try {
                    t.action(f);
                }
                catch {

                }
            }
        });
    }

    __add_trigger(trigger) {
        this._triggers.push(trigger);
    }
}
