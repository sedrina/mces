class Effect {
    constructor(caster, target, type, value, duration) {
        this.type = type;
        this.caster = caster;
        this.target = target;
        this.value = value;
        this.duration = duration;
        this.unremoveable = false;
        this.persistent = false;
    }

    add(value){
        switch (this.type) {
            // Status Effects.....
            case EffectType.Stun:
                console.log('ADD STUN', value, this.duration);
                this.target.status.stun += value;
                this._stop_casting(this.target.status.stun);
                break;
            case EffectType.Sleep:
                this.target.status.sleep += value;
                this._stop_casting(this.target.status.sleep);
                break;
            case EffectType.Freeze:
                this.target.status.freeze += value;
                this._stop_casting(this.target.status.freeze);
                break;
            case EffectType.Silence:
                this.target.status.silence += value;
                this._stop_casting(this.target.status.silence);
                break;
            case EffectType.Taunt:
                this.target.status.taunt += value;
                break;
            case EffectType.Mark:
                this.target.status.mark += value;
                break;
            case EffectType.Invulnerable:
                this.target.status.invulnurable += value;
                break;
            // Modifier Effects..
            // Dodge
            case EffectType.Dodge:
                this.target.modifier.dodge += value;
                break;
            case EffectType.HitChance:
                this.target.modifier.hit_chance += value;
                break;
            // Critical Strike
            case EffectType.CriticalHit:
                this.target.modifier.critcal += value;
                break;
            case EffectType.Elasticty:
                this.target.modifier.elasticty += value;
                break;
            case EffectType.Maximize:
                this.target.modifier.maxismize += value;
                break;
            // Damage modification
            case EffectType.DamageDealt:
                this.target.modifier.damage_dealt += value;
                break;
            case EffectType.DamageReduction:
                this.target.modifier.damage_reduction += value;
                break;
            // Damage Countering
            case EffectType.Block:
                this.target.modifier.block += value;
                break;
            case EffectType.CounterAttack:
                this.target.modifier.counter_attack += value;
                break;
            case EffectType.ReflectiveDamage:
                this.target.modifier.reflective_damage += value;
                break;
            // Healing
            case EffectType.HealingDone:
                this.target.modifier.healing_done += value;
                break;
            case EffectType.Recovery:
                this.target.modifier.recovery += value;
                break;
            case EffectType.Lifesteal:
                this.target.modifier.lifesteal += value;
                break;
            // Imminuties
            case EffectType.Immunity2Bleed:
                this.target.modifier.immunity_to_bleed += value;
                break;
            case EffectType.Immunity2CrestOfChaos:
                this.target.modifier.immunity_to_crest_of_chaos += value;
                break;
            case EffectType.Immunity2CrestOfDespair:
                this.target.modifier.immunity_to_crest_of_despair += value;
                break;
            case EffectType.Immunity2CrestOfDest:
                this.target.modifier.immunity_to_crest_of_desturction += value;
                break;
            case EffectType.Immunity2Exhaust:
                this.target.modifier.immunity_to_exhaust += value;
                break;
            case EffectType.Immunity2Freeze:
                this.target.modifier.immunity_to_freeze += value;
                break;
            case EffectType.Immunity2Instakill:
                this.target.modifier.immunity_to_instakill += value;
                break;
            case EffectType.Immunity2Silence:
                this.target.modifier.immunity_to_silence += value;
                break;
            case EffectType.Immunity2Sleep:
                this.target.modifier.immunity_to_sleep += value;
                break;
            case EffectType.Immunity2Stun:
                this.target.modifier.immunity_to_stun += value;
                break;
            case EffectType.Shield:
                // No needs for action
                break;
            // Flat Modification
            case EffectType.FlatATK:
                this.target.primary_stats.atk += value;
                break;
            case EffectType.FlatArmor:
                this.target.primary_stats.armor += value;
                break;
            case EffectType.FlatHP:
                this._update_hp(value);
                break;
            case EffectType.FlatAttackSpeed:
                break;
            case EffectType.FlatSkillSpeed:
                break;
            // Percent modification
            case EffectType.PercentATK:
                this.target.primary_stats.atk += Math.floor(this.target._base_primary_stats.atk * value);
                break;
            case EffectType.PercentArmor:
                this.target.primary_stats.armor += Math.floor(this.target._base_primary_stats.armor * value);
                break;
            case EffectType.PercentHP:
                this._update_hp(Math.floor(this.target._base_primary_stats.max_hp * value));
                break;
            case EffectType.PercentAttackSpeed:
            {
                value = this.target._base_primary_stats.attack_cd * value / 2;
                this.target.primary_stats.attack_cd -= value;
                if ( value > 0 ) {
                    this.target.action_power += value;
                }
            }
            break;
            case EffectType.PercentSkillSpeed:
                this._update_skill_speed(value);
                break;
            // Stat changes
        }
    }

    remove() {
        this.add(-this.value);
        this.type = EffectType.Dummy;
        this.duration = -1;
    }

    update(delta) {
        if ( this.duration > 0 ) {
            this.duration -= delta;
            if ( this.duration <= 0 ) {
                this.add(-this.value);
            }
        }
    }

    makeUnremoveable() {
        this.unremoveable = true;
    }

    makePersistent() {
        this.unremoveable = true;
        this.persistent = true;
    }

    get isRemoveableBuff() {
        return !this.unremoveable && this.target.team_id === this.caster.team_id;
    }

    get isRemoveableDebuff() {
        return !this.unremoveable && this.target.team_id !== this.caster.team_id;
    }

    _stop_casting(value) {
        if ( value > 0 ) {
            this.target.stopCasting();
        }
    }

    _update_hp(value) {
        this.target.primary_stats.max_hp += value;
        if ( value > 0 ) {
            this.target.current_hp += value;
        }
        this.target.current_hp = std_max(this.target.current_hp, this.target.primary_stats.max_hp);
    }

    _update_skill_speed(percent) {
        this.target.active_skills.forEach(skill => {
           let tmp = skill.base_cooldown * percent / 2;
           skill.cooldown -= tmp;
           if ( tmp > 0 ) {
               skill.action_power += tmp;
           }
        });
    }
}


class BleedingEffect extends Effect
{
    constructor(fctx, damage_value, damage_type, duration)
    {
        super(fctx.caster, fctx.target, EffectType.Bleeding, damage_value, duration);
        this.tick_counter = 1;
        this.damage_type = damage_type;
    }

    update(delta) {
        if ( this.duration > 0 ) {
            this.duration -= delta;
            if ( this.tick_counter > 0 ) {
                this.tick_counter -= delta;
                if ( this.tick_counter <= 0 ) {
                    this.tick_counter = 1;
                    this._apply_damage();
                }
            }
        }
    }

    remove() {
        return;
    }

    _apply_damage() {
        // TODO what is the apply mechanism???
    }

}


class DelayedEffect extends Effect {
    constructor(fctx, delay_time, cb)
    {
        super(fctx.caster, fctx.target, EffectType.Delayed, 0, delay_time);
        this.cb_function = cb;
        this.ctx = fctx;
    }

    update(delta) {
        if ( this.duration > 0 ) {
            this.duration -= delta;
            if ( this.duration <= 0 ) {
                try {
                    this.cb_function(this.ctx);
                }
                catch {

                }
            }
        }
    }

    _apply_damage() {
        // TODO what is the apply mechanism???
    }

}
