class Crest {
    constructor() {
        this.destruction = 0;
        this.despair = 0;
        this.chaos = 0;
    }
}

class PrimaryStats {
    constructor(data) {
        this.max_hp = data.hp;
        this.atk = data.atk;
        this.armor = data.armor;
        this.attack_cd = data.speed;
    }
}

class ModiferStats{
    constructor()
    {
        this.hp = 1;
        this.atk = 1;
        this.armor = 1;
        this.attack_cd = 1;
        this.skill_speed = 1;
        this.hit_chance = 0;
        this.dodge = 0;
        this.counter_attack = 0;
        this.block = 0;
        this.critcal = 0;
        this.maxismize = 0;
        this.elasticty = 0;
        this.recovery = 1;
        this.healing_done = 1;
        this.damage_dealt = 1;
        this.damage_reduction = 0;
        this.lifesteal = 0;
        this.reflective_damage = 0;
        this.immunity_to_bleed = 0;
        this.immunity_to_stun = 0;
        this.immunity_to_silence = 0;
        this.immunity_to_sleep = 0;
        this.immunity_to_exhaust = 0;
        this.immunity_to_freeze = 0;
        this.immunity_to_instakill = 0;
        this.immunity_to_crest_of_desturction = 0;
        this.immunity_to_crest_of_despair = 0;
        this.immunity_to_crest_of_chaos = 0;
    }
}

class Status {
    constructor(){
        this.stun = 0;
        this.sleep = 0;
        this.exhaust = 0;
        this.silence = 0;
        this.invulnurable = 0;
        this.revived = 0;
        this.taunt = 0;
        this.mark = 0;
        this.freeze = 0;
    }
}


class Skill {
    constructor(name, data) {
        this.name = name;
        this.cooldown = data.cooldown;
        this.cd_counter = this.cooldown;
        this.target_type = data.target_type;
        this.cast_time = 0;
        this.apply = data.apply;
    }

    // apply(f) {
    //     // it should be override with data.hero.skill.apply
    // }

    is_castable(){
        return this.cd_counter <= 0;
    }
}

class BasicAttack{
    constructor() {
        this.name = 'Basic Attack';
        this.target_type = TargetType.OneEnemy;
    }

    apply(f){
        f.dealDamage(1);
    }

    is_castable(){
        return true;
    }
}

class CastingSkill {
    constructor(skill, target) {
        this.skill = skill;
        this.counter = skill.cast_time;
        this.target = target;
    }
}


class Hero {
    constructor(name, team_id, data){
        this.team_id = team_id;
        this.name = name;
        this.race = data.race;
        this.active_skills = [];
        this.passive_skills = [];
        this.effects = [];
        this._base_primary_stats = new PrimaryStats(data);
        this.primary_stats = new PrimaryStats(data);
        this.modifier = new ModiferStats();
        this.status = new Status();
        this.crest = new Crest();
        this.action_power = this.primary_stats.attack_cd;
        this.current_hp = this.primary_stats.max_hp;
        this.casting_skill = null;
        this._generate_skills(data);
    }

    wakeUpFromSleep() {
        this.status.sleep = 0;
    }

    isReady() {
        return this.isAlive() &&
            this.action_power <= 0 &&
            this.status.stun === 0 &&
            this.status.sleep === 0 &&
            this.status.freeze === 0;
    }

    isTargetableByAlly() {
        return this.isAlive() && this.status.freeze === 0;
    }

    isTargetableByEnemy() {
        return this.isAlive() && this.status.freeze === 0 && this.status.invulnurable === 0;
    }

    isReadyForCastingSkill() {
        return this.casting_skill;
    }

    isAlive() {
        return this.current_hp > 0;
    }

    stopCasting() {
        if ( this.casting_skill ) {
            this.casting_skill = null;
        }
    }

    removeEffectByType(effect_type) {
        this.effects.forEach(effect => {
            if (effect.type === effect_type) {
                effect.remove();
            }
        });
    }

    tick(elapsed){
        if ( this.current_hp <= 0 ) {
            return;
        }

        this.effects.forEach(effect => effect.update(elapsed));
        this.effects = this.effects.filter(e => e.duration > 0);

        if ( this.status.stun > 0 || this.status.freeze > 0 ) {
            return;
        }

        let elapsed_for_skill_time = elapsed / this.modifier.skill_speed;

        if ( this.casting_skill ) {
            this.casting_skill.counter -= elapsed_for_skill_time;
            return;
        }

        let elapsed_for_action_time = elapsed / this.modifier.attack_cd;
        this.action_power -= elapsed_for_action_time;
        this.active_skills.forEach(skill => {
            skill.cd_counter = std_max(skill.cd_counter - elapsed_for_skill_time, 0);
        });
    }

    get_avaliable_skills() {
        if ( this.status.silence > 0 ) {
            return [];
        }
        return this.active_skills.filter(s => s.is_castable() );
    }

    _generate_skills(data) {
        for ( let name in data.active_skills) {
            this.active_skills.push(new Skill(name, data.active_skills[name]));
        }
        for ( let name in data.passive_skills) {
            this.passive_skills.push(new Skill(name, data.passive_skills[name]));
        }
    }

}

class Trigger {
    constructor(type, owner, cb, duration) {
        this.type = type;
        this.owner = owner;
        this.action = cb;
        this.duration = duration || 1000;
        this._period = 0;
        this._period_counter = 0;
        this._avalible = 9999;
    }

    period(value) {
        this._period = value;
        this._period_counter = 0;
    }

    useCount(value) {
        this._avalible = value;
    }

}