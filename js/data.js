const HEROES = {
    empty: {
        hp: 0,
        atk: 0,
        armor: 0,
        speed: 2.08,
        race: Race.Devil,
        active_skills: {
            underworlds_seal: {
                cooldown: 7,
                target_type: TargetType.OneEnemy,
                apply: function (f) {
                    f.dealPierceDamage(1);
                    f.removeBuffs(999);
                }
            },
            consecutive_cuttins: {
                cooldown: 7,
                target_type: TargetType.OneEnemy,
                apply: function (f) {
                    f.dealDamage(1);
                    f.dealDamage(1);
                }
            },
        },
        passive_skills: {
        }
    },
    dante: {
        hp: 22644,
        atk: 3423,
        armor: 4024,
        speed: 2.08,
        race: Race.Devil,
        active_skills: {
            underworlds_seal: {
                cooldown: 7,
                target_type: TargetType.OneEnemy,
                apply: function (f) {
                    f.dealPierceDamage(1);
                    f.removeBuffs(999);
                }
            },
            consecutive_cuttins: {
                cooldown: 7,
                target_type: TargetType.OneEnemy,
                apply: function (f) {
                    f.dealDamage(1);
                    f.dealDamage(1);
                }
            },
        },
        passive_skills: {
            flicker: {
                apply: function (f) {
                    f.addTrigger(When.BattleStarted, function (t) {
                        t.ownerCtx.dodgeChance(0.21, 999).makeUnremoveable();
                        t.ownerCtx.critiacalStrikeChance(0.27, 999).makeUnremoveable();
                        t.ownerCtx.lifesteal(0.1, 999).makeUnremoveable();
                    });
                    f.addTrigger(When.Dodged, function (t) {
                        t.ownerCtx.critiacalStrikeChance(1, 1);
                        t.ownerCtx.setActionPower(0);
                    });
                    f.addTrigger(When.CriticalHitDealt, function (t) {
                        t.ownerCtx.setActionPower(1);
                    });
                }
            },
            ruination: {
                apply: function (f) {
                    f.addTrigger(When.OnAttacked, function (t) {
                        t.ownerCtx.modifyDamageDealt(0.2, 6);
                    });
                }
            }
        }
    },
    maya: {
        hp: 22644,
        atk: 3423,
        armor: 4024,
        speed: 2.08,
        race: Race.Human,
        active_skills: {
            silver_edge_of_justice: {
                cooldown: 6,
                target_type: TargetType.OneEnemy,
                apply: function (f) {
                    f.dealDamage(2);
                    f.modifyHealingDone(-0.5, 5);
                    let removed = f.removeBuffs(1);
                    if ( removed ) {
                        f.dealPierceDamage(1);
                    }
                }
            },
            shroud_of_darkness: {
                cooldown: 6,
                target_type: TargetType.AllEnemies,
                apply: function (f) {
                    f.dealPierceDamage(0.5);
                    f.modifyDamageDealt(-0.4, 3);
                }
            }
        },
        passive_skills: {
            steadfast_courage: {
                apply: function (f) {
                    f.addTrigger(When.OnAttacked, function (t) {
                        if ( with_certain_chance()) {
                            t.ownerCtx.addActionPower(0.2);
                        }
                    });
                }
            },
            ruination: {
                apply: function (f) {
                    f.addTrigger(When.BaseAttacked, function (t) {
                        if ( t.triggerCtx.targetHpRatio > 0.5 ) {
                            t.triggerCtx.dealLeechDamage(2);
                        }
                    });
                }
            }
        }
    },
    minuel: {
        hp: 25443,
        atk: 4626,
        armor: 4626,
        speed: 3.00,
        race: Race.Angel,
        active_skills: {
            minuel_1: {
                cooldown: 12,
                target_type: TargetType.OneEnemy,
                apply: function (f) {
                    f.stun(3);
                    f.delayed(0.1, g => {
                        let val = g.getTotalShield();
                        g.forAllEnemies(h => {
                            h.dealFlatDamage(val);
                        })
                    });
                }
            },
            ethernal_aptheon: {
                cooldown: 12,
                target_type: TargetType.Self,
                apply: function (f) {
                    f.modifyDamageDealt(0.3, 5);
                    f.modifyAttackSpeed(1, 5);
                    // Timed jobs...
                    f.removeDebuffs(5);
                }
            }
        },
        passive_skills: {
            minuel_passive_1: {
                apply: function (f) {
                    f.addTrigger(When.BaseAttacked, t => {
                        t.triggerCtx.dealPierceDamage(0.5);
                    }, );
                    f.addTrigger(When.Blocked, t =>  {
                        t.ownerCtx.forAllAllies(fx =>{
                            fx.shieldByCasterMaxHp(50, 4);
                        });
                    }).period(5);
                    f.addTrigger(When.CounterAttacked, t => {
                        t.ownerCtx.healByMaxHp(5);
                    }).period(3);
                    f.addTrigger(When.OnStruck, t => {
                        if ( with_certain_chance() ) {
                            t.triggerCtx.silence(2);
                        }
                    });
                }
            },
            the_first_apotheon: {
                apply: function (f) {
                    f.addTrigger(When.Died, t => {
                        t.ownerCtx.reviveByMaxHp(0.15);
                    }).useCount(1);
                    f.addTrigger(When.Revived, t => {
                        t.ownerCtx.forAllAllies(fx => {
                           fx.healByMaxHp(0.15);
                           fx.shieldByCasterMaxHp(0.15, 5);
                        });
                    }).useCount(1);
                }
            }
        }
    },
};