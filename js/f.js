function is_missed(miss, hit) {
    let v = 1 - miss + hit;
    return Math.random() > v;
}

function is_success(value) {
    return value > Math.random();
}

function with_chance(value) {
    return value > Math.random();
}

function with_low_chance() {
    return with_chance(0.1);
}

function with_certain_chance() {
    return with_chance(0.5);
}

function with_very_high_chance() {
    return with_chance(0.9);
}

class F {
    constructor(arena, caster, target){
        this.arena = arena;
        this.caster = caster;
        this.target = target;
    }

    // Damage dealing
    dealFlatDamage(value){
        return this._apply_damage(value, 0);
    }

    dealDamage(percent){
        let value = this._get_normal_attack_value() * percent;
        return this._apply_damage(value, 0);
    }

    dealPierceDamage(percent){
        let value = this.caster.primary_stats.atk * percent;
        return this._apply_damage(value, 0);
    }

    dealDashDamage(percent) {
        let value = this._get_dash_attack_value() * percent;
        return this._apply_damage(value, 0);
    }

    dealLeechDamage(percent) {
        let value = this._get_normal_attack_value() * percent;
        return this._apply_damage(value, 1);
    }

    dealPiercingLeechDamage(percent) {
        let value = this.caster.primary_stats.atk * percent;
        return this._apply_damage(value, 1);
    }

    dealAmplifiedDamage(percent) {
        let value = this._get_normal_attack_value() * percent;
        value *= ( 1 + this.caster.current_hp / this.caster.primary_stats.max_hp);
        return this._apply_damage(value, 0);
    }

    dealBleedDamage(percent, duration){
        if ( is_success(this.target.modifier.immunity_to_bleed) ) {
            return;
        }
        // TODO what is the bleeding damage modify, dodge, critic mechanism ??
        let value = this._get_normal_attack_value() * percent;
        this._apply_bleed_damage(DamageType.Normal, value, duration);
    }

    dealBleedPierceDamage(caster, target, percent, duration){
        if ( is_success(this.target.modifier.immunity_to_bleed) ) {
            return;
        }
        // TODO what is the bleeding damage modify, dodge, critic mechanism ??
        let value = this.caster.primary_stats.atk * percent;
        this._apply_bleed_damage(DamageType.Piercing, value, duration);
    }

    // Healing
    healFlat(value) {
        return this._heal(value);
    }

    heal(percent) {
        return this._heal(this.caster.primary_stats.atk * percent );
    }

    healByMaxHp(percent) {
        return this._heal(this.caster.primary_stats.max_hp * percent );
    }

    healOverTime(percent, duration, tick_time) {
        notImplemented();
        return this._heal(this.caster.primary_stats.max_hp * percent );
    }

    // Coword Control
    silence(duration) {
        if ( is_success(this.target.modifier.immunity_to_silence) ) {
            return;
        }
        return this._add_effect(EffectType.Silence, 1, duration);
    }

    stun(duration) {
        if ( is_success(this.target.modifier.immunity_to_stun) ) {
            return;
        }
        console.log('minuel hit stun');
        return this._add_effect(EffectType.Stun, 1, duration);
    }

    freeze(duration) {
        if ( is_success(this.target.modifier.immunity_to_freeze) ) {
            return;
        }
        return this._add_effect(EffectType.Freeze, 1, duration);
    }

    sleep(duration) {
        if ( is_success(this.target.modifier.immunity_to_sleep) ) {
            return;
        }
        return this._add_effect(EffectType.Sleep, 1, duration);
    }

    invulnurable(duration) {
        return this._add_effect(EffectType.Invulnerable, 1, duration);
    }

    exhaust(duration) {
        if ( is_success(this.target.modifier.immunity_to_exhaust) ) {
            return;
        }
        return this._add_effect(EffectType.Exhaust, 1, duration);
    }

    taunt(duration) {
        return this._add_effect(EffectType.Taunt, 1, duration);
    }

    mark(duration) {
        return this._add_effect(EffectType.Mark, 1, duration);
    }

    removeMark() {
        this.target.removeEffectByType(EffectType.Mark);
    }

    // Crest Management
    addCrestOfDestruction(count) {
        if ( is_success(this.target.modifier.immunity_to_crest_of_desturction) ) {
            return;
        }
        this.target.crest.destruction = std_max(5, this.target.crest.destruction + count);
    }

    addCrestOfDespair(count) {
        if ( is_success(this.target.modifier.immunity_to_crest_of_despair) ) {
            return;
        }
        this.target.crest.despair = std_max(5, this.target.crest.despair + count);
    }

    addCrestOfChaos(count) {
        if ( is_success(this.target.modifier.immunity_to_crest_of_chaos) ) {
            return;
        }
        this.target.crest.chaos = std_max(5, this.target.crest.chaos + count);
    }

    withCrestOfDestruction(cb) {
        let tmp = this.target.crest.destruction;
        if ( tmp > 0 ) {
            this.target.crest.destruction = 0;
            cb(tmp);
        }
    }

    withCrestOfDespair(cb) {
        let tmp = this.target.crest.despair;
        if ( tmp > 0 ) {
            this.target.crest.despair = 0;
            cb(tmp);
        }
    }

    withCrestOfChaos(cb) {
        let tmp = this.target.crest.chaos;
        if ( tmp > 0 ) {
            this.target.crest.chaos = 0;
            cb(tmp);
        }
    }

    // Triggers
    addTrigger(when, cb, duration) {
        let t = new Trigger(when, this.caster, cb, duration);
        this.arena.__add_trigger(t);
        return t;
    }

    // Shields
    shield(percent, duration) {
        return this.shieldFlat(this.caster.primary_stats.atk * percent, duration);
    }

    shieldByMaxHP(percent, duration) {
        return this.shieldFlat(this.caster.primary_stats.max_hp * percent, duration);
    }

    shieldByCurrentHP(percent, duration) {
        return this.shieldFlat(this.caster.current_hp  * percent, duration);
    }

    shieldFlat(value, duration) {
        value = Math.floor(value);
        return this._add_effect(EffectType.Shield, value, duration);
    }

    getTotalShield() {
        let sum = 0;
        this.target.effects.forEach(effect => {
            if (effect.type === EffectType.Shield) {
                //console.log('shiled count...', effect.value);
                sum += effect.value;
            }
        });
        return sum;
    }

    destroyShields() {
        return 0;
    }

    // Effect Management
    removeBuffs(count) {
        let buffs = this.target.effects.filter( e => e.isRemoveableBuff);
        return this._remove_effects_from_target(buffs, count);
    }

    removeDebuffs(count) {
        let buffs = this.target.effects.filter( e => e.isRemoveableDebuff);
        return this._remove_effects_from_target(buffs, count);
    }

    removeEffect(effect) {
        effect.remove();
    }

    // Revive
    revive(percent) {
        this.reviveWithFlatHp(this.caster.primary_stats.atk * percent);
    }

    reviveWithFlatHp(value) {
        this.target.current_hp = Math.floor(value);
        this._run_trigger(When.Revived, this.target, this.caster);
    }

    // Action Power Modification
    setActionPower(value) {
        this.target.action_power = this.target.primary_stats.attack_cd - value;
    }

    increaseActionPower(value) {
        this.target.action_power += (value * 0.01);
    }

    increaseAttackSpeed(percent, duration) {
        if ( percent < 0 ) {
            throw 'negative increaseAttackSpeed is not allowed use decreaseAttackSpeed';
        }
        return this._add_effect(EffectType.PercentAttackSpeed, percent, duration);
    }

    decreaseAttackSpeed(percent, duration) {
        if ( percent < 0 ) {
            throw 'negative decreaseAttackSpeed is not allowed use increaseAttackSpeed';
        }
        return this._add_effect(EffectType.PercentAttackSpeed, -percent, duration);
    }

    // Healt Limit modifier
    gainMaxHPFlat(value) {
        return this._add_effect(EffectType.FlatHP, value);
    }

    // Healt Limit modifier
    gainMaxHPPercent(percent) {
        return this._add_effect(EffectType.PercentHP, percent);
    }

    // Get Status...
    get casterATK() {
        return this.caster.primary_stats.atk;
    }

    get casterArmor() {
        return this.caster.primary_stats.armor;
    }

    get casterMaxHP() {
        return this.caster.primary_stats.max_hp;
    }

    get casterCurrentHP() {
        return this.caster.current_hp;
    }

    get targetATK() {
        return this.target.primary_stats.atk;
    }

    get targetArmor() {
        return this.target.primary_stats.armor;
    }

    get targetMaxHP() {
        return this.target.primary_stats.max_hp;
    }

    get targetCurrentHP() {
        return this.target.current_hp;
    }

    // modifiers
    dodgeChance(percent, duration) {
        return this._add_effect(EffectType.Dodge, percent, duration);
    }

    hitChance(percent, duration) {
        return this._add_effect(EffectType.HitChance, percent, duration);
    }

    counterAttackChance(percent, duration) {
        return this._add_effect(EffectType.CounterAttack, percent, duration);

    }
    blockChance(percent, duration) {
        return this._add_effect(EffectType.Block, percent, duration);
    }

    critiacalStrikeChance(percent, duration) {
        return this._add_effect(EffectType.CriticalHit, percent, duration);
    }

    damageReduction(percent, duration) {
        return this._add_effect(EffectType.DamageReduction, percent, duration);
    }

    damageDealt(percent, duration) {
        return this._add_effect(EffectType.DamageDealt, percent, duration);
    }

    lifesteal(percent, duration) {
        return this._add_effect(EffectType.Lifesteal, percent, duration);
    }

    reflection(percent, duration) {
        return this._add_effect(EffectType.ReflectiveDamage, percent, duration);
    }

    healingDone(percent, duration){
        this._add_effect(EffectType.HealingDone, percent, duration);
    }

    recovery(percent, duration) {
        this._add_effect(EffectType.Recovery, percent, duration);
    }

    maxsimize(percent, duration) {
        return this._add_effect(EffectType.Maximize, percent, duration);
    }

    elasticty(percent, duration) {
        return this._add_effect(EffectType.Elasticty, percent, duration);
    }


    forAllEnemies(cb) {
        let enemies = this.arena._get_multi_targetable_enemies(this.caster);
        this._call_with_new_context(enemies);
    }

    forAllLiveAllies(cb) {
        let allies = this.arena._get_targetable_allies(this.caster);
        this._call_with_new_context(allies);
    }

    forAllDeadllies(cb) {
        let allies = this.arena._get_dead_allies(this.caster);
        this._call_with_new_context(allies);
    }



    delayed(delay_time, cb) {
        let tmp = new DelayedEffect(this.triggerCtx, delay_time, cb);
        this.target.effects.push(tmp);
        return tmp;
    }

    _add_effect(type, value, duration) {
        let e = new Effect(this.caster, this.target, type, value, duration);
        e.add(value);
        this.target.effects.push(e);
        return e;
    }

    get ownerCtx() {
        return new F(this.arena, this.caster, this.caster);
    }

    get triggerCtx() {
        return new F(this.arena, this.caster, this.target);
    }

    get ctxCasterCaster() {
        return new F(this.arena, this.caster, this.caster);
    }

    get ctxCasterTarget() {
        return new F(this.arena, this.caster, this.target);
    }

    get targetIsStunned() {
        return this.target.status.stun > 0;
    }

    get targetIsMarked() {
        return this.target.status.mark > 0;
    }

    get targetIsTaunted() {
        return this.target.status.taunt > 0;
    }

    get targetIsBleeding() {
        return this.target.effects.filter(e => e.type === EffectType.Bleeding).length > 0;
    }

    get targetHpRatio() {
        return this.target.current_hp / this.target.primary_stats.max_hp;
    }

    // Privates...
    _get_normal_attack_value() {
        return (this.caster.primary_stats.atk * this.caster.primary_stats.atk ) /
            (this.caster.primary_stats.atk + this.target.primary_stats.armor);
    }

    _get_dash_attack_value() {
        return (this.caster.primary_stats.armor * this.caster.primary_stats.armor ) /
            (this.caster.primary_stats.armor + this.target.primary_stats.armor);
    }

    _apply_damage(value, lifesteal_bonus) {
        value = this._calculate_damage(value);
        if ( value === -1 ) {
            return 0;
        }
        if ( value === -2 ) {
            return 0;
        }
        value = this._damage_to_shields(value);
        if ( value > 0 ) {
            this._deal_damage(value);
            this._make_lifesteal(value, lifesteal_bonus);
        }
        this._apply_counter_damages(value);
        return value;
    }

    _apply_bleed_damage(damage_type, total_damage, duration) {
        let f = new F(this.arena, this.caster, this.target);
        let damage = Math.floor(total_damage / duration);
        let e = new BleedingEffect(f, value, DamageType.Normal, duration);
        e._apply_damage();
        this.target.effects.push(e);
    }

    _damage_to_shields(value) {
        for ( let i in this.target.effects ) {
            let effect = this.target.effects[i];
            if ( effect.type !== EffectType.Shield ) {
                continue;
            }
            if ( value >= effect.value ) {
                value -= effect.value;
                effect.remove();
            }
            else {
                effect.value -= value;
                return 0;
            }
        }
        return value;
    }

    _remove_effects_from_target(effect_list, count) {
        if ( effect_list.length === 0 ) {
            return 0;
        }
        if ( effect_list.length <= count ) {
            count = effect_list.length;
            // TODO remove all effects from target, no needs for random selection
        }

        let random_effects = shuffle(effect_list).slice(0, count);
        let remove_indexes = [];
        for ( let i = 0 ; i < this.target.effects.length; i++ ) {
            for ( let j = 0; j < random_effects.length; j++ ) {
                if ( this.target.effects[i] === random_effects[j]) {
                    remove_indexes.push(i);
                    break;
                }
            }
        }
        for ( let i = 0; i < remove_indexes.length; i++ ) {
            let index = remove_indexes[i] - i;
            this.target.effects.slice(index, index +1);
        }
        random_effects.forEach(e => e.remove());
        return count;
    }

    _calculate_damage(value) {
        if ( this.target.status.invulnurable ) {
            return -1;
        }
        let dodge = std_max(this.target.modifier.dodge, 0);
        let hit = std_max(this.caster.modifier.hit_chance, 0);

        if ( is_missed(dodge, hit) ) {
            this._run_trigger(When.Dodged, this.target, this.caster);
            return -2;
        }

        if ( is_success(this.caster.modifier.critcal) ) {
            this._run_trigger(When.CriticalHitDealt, this.caster, this.target);
            this._run_trigger(When.CriticalHitTaken, this.target, this.caster);
            var maximize = std_max(this.caster.modifier.maxismize, 0);
            var elasticty = std_max(this.target.modifier.elasticty, 0);
            value *= (1.5 + maximize);
            value *= (1 - elasticty);
        }

        let dmg_dealt = std_max(this.caster.modifier.damage_dealt, 0);
        let dmg_reduce = std_max(this.target.modifier.damage_reduction, 0); // TODO ??

        value *= dmg_dealt;
        value *= (1 - dmg_reduce);

        if ( value === 0 ) {
            return 0;
        }

        if ( is_success(this.target.modifier.block) ) {
            this._run_trigger(When.Blocked, this.target, this.caster);
            value /= 2;
        }

        value = Math.floor(value);
        if ( this.target.current_hp <= value ) {
            value = this.target.current_hp;
        }

        return value;
    }

    _make_lifesteal(damage, bonus) {
        let lifesteal = std_max(this.caster.modifier.lifesteal, 0);
        let value = damage * ( bonus + lifesteal);
        if ( value > 0 && this.caster.status.exhaust === 0) {
            new F(this.arena, this.caster, this.caster)._heal(value);
        }
    }

    _deal_damage(value) {
        this.target.current_hp -= value;
        if ( this.target.current_hp <= 0 ) {
            this._run_trigger(When.OnAttacked, this.caster, this.target);
            this._run_trigger(When.Killed, this.caster, this.target);
            this._run_trigger(When.Died, this.target, this.caster);
            throw 'Died'
        }
        else {
            this.target.wakeUpFromSleep();
            this._run_trigger(When.OnAttacked, this.caster, this.target);
            this._run_trigger(When.OnStruck, this.target, this.caster);
        }
    }

    _apply_counter_damages(value) {
        if ( this.target.modifier.reflective_damage > 0 ) {
            let fx = F(this.target, this.caster);
            fx._deal_reflective_damage(value * this.target.modifier.reflective_damage);
        }

        if ( is_success(this.target.modifier.counter_attack) ) {
            let fx = F(this.target, this.caster);
            fx.dealDamage(1);
            this._run_trigger(When.CounterAttacked, this.target, this.caster);
        }
    }

    _deal_reflective_damage(value) {

    }

    _heal(value) {
        if ( this.target.status.exhaust > 0 ) {
            return;
        }
        let recovery = std_max(this.target.modifier.recovery, 0);
        let heal_done = std_max(this.caster.modifier.healing_done, 0);
        let heal_count = value * recovery * heal_done;
        heal_count = std_min(this.caster.primary_stats.max_hp - this.caster.current_hp, heal_count);
        this.caster.current_hp += heal_count;
    }

    _run_trigger(when, owner, cause) {
        cause = cause || cause === this.target ? this.caster : this.target;
        this.arena.__run_trigger(when, owner, cause);
    }

    _call_with_new_context(targets) {
        targets.forEach(target => {
            try {
                let tmp = new F(this.arena, this.caster, target);
                cb(tmp);
            }
            catch {

            }
        });
    }

}
