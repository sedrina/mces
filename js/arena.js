function random_from_array(array) {
    return array[Math.floor(Math.random() * array.length)];
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
        while (this._is_finished() === false ) {
            this._apply_next_action();
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
                this.__apply_skill_to_target(h, h, ps);
            });
        });
    }

    _trace_arena() {
        console.log('Alive counts:', this._get_alive_count(1), this._get_alive_count(2), ' game time:', this._game_time);
    }

    _apply_next_action() {
        let candicate = this._check_action();
        while ( candicate && !this._is_finished() ) {
            this._apply_action(candicate);
            candicate = this._check_action();
        }
        this._tick(this._time_delta);
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

    _check_action() {
        // Also check casting times...
        for ( let i in this.heroes) {
            let hero = this.heroes[i];
            if ( hero.isReady() ) {
                return hero;
            }
        }
        return null;
    }

    _apply_action(hero) {
        this.__run_trigger(When.TurnStarted, hero);
        hero.action_power = hero.primary_stats.attack_cd / hero.modifier.attack_cd;
        let skills = hero.get_avaliable_skills();
        if ( skills.length > 0 ) {
            let skill = random_from_array(skills);
            this._apply_skill(hero, skill);
            return;
        }
        this._apply_base_attack(hero);
    }

    _apply_base_attack(hero) {
        const enemies = this._get_single_targetable_enemies(hero);
        if ( enemies.length === 0 ) {
            return;
        }
        let target = random_from_array(enemies);
        let aa = new BasicAttack();
        this.__apply_skill_to_target(hero, target, aa);
        this.__run_trigger(When.BaseAttacked, hero, target);
    }

    _apply_skill(hero, skill) {
        skill.cd_counter = skill.cooldown;
        if ( skill.target_type === TargetType.AllEnemies ) {
            let enemies = this._get_multi_targetable_enemies(hero);
            enemies.forEach(target => {
                this.__apply_skill_to_target(hero, target, skill);
            });
            return;
        }

        if ( skill.target_type === TargetType.OneEnemy ) {
            const enemies = this._get_single_targetable_enemies(hero);
            if ( enemies.length === 0 ) {
                return;
            }
            let target = random_from_array(enemies);
            this.__apply_skill_to_target(hero, target, skill);
            return;
        }

        if ( skill.target_type === TargetType.Self ) {
            this.__apply_skill_to_target(hero, hero, skill);
            return;
        }


        if ( skill.target_type === TargetType.OneAlly ) {
            let allies = this._get_targetable_allies(hero);
            let target = random_from_array(allies);
            this.__apply_skill_to_target(hero, target, skill);
            return;
        }

        if ( skill.target_type === TargetType.Allies ) {
            let allies = this._get_targetable_allies(hero);
            allies.forEach(target => {
                this.__apply_skill_to_target(hero, target, skill);
            });
            return;
        }
        throw 'Invalid target type';
    }

    __apply_skill_to_target(hero, target, skill) {
        try {
            let f = new F(this, hero, target);
            skill.apply(f);
        }
        catch {
        }
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
            if ( h.current_hp > 0 && h.team_id === team_id ) {
                tmp++;
            }
        });
        return tmp;
    }

    __run_trigger(when, caster, trigger_hero) {
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
