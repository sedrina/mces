let HEROES = {
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
                        //t.ownerCtx.dodgeChance(0.21, 999).makeUnremoveable();
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
};