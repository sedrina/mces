const TargetType = {
    "None":1,
    "Self":2,
    "OneAlly":3,
    "Allies":4,
    "OneEnemy": 5,
    "AllEnemies": 6
};
Object.freeze(TargetType);

const Race = {
    "None":1,
    "Human":2,
    "Elf":3,
    "Beast": 4,
    "Teuton": 5,
    "Angel": 6,
    "Devil": 7
};
Object.freeze(Race);

const EffectType = {
    'Dummy': 1,
    'HitChance': 6,
    'Dodge': 7,
    'CounterAttack': 8,
    'Block': 9,
    'CriticalHit': 10,
    'Maximize': 11,
    'Elasticty': 12,
    'Recovery': 13,
    'HealingDone': 14,
    'DamageDealt': 15,
    'DamageReduction': 16,
    'Lifesteal': 17,
    'ReflectiveDamage': 18,
    'Immunity2Bleed': 19,
    'Immunity2Stun': 20,
    'Immunity2Silence': 21,
    'Immunity2Sleep': 22,
    'Immunity2Exhaust': 23,
    'Immunity2Freeze': 24,
    'Immunity2Instakill': 25,
    'Immunity2CrestOfDest': 26,
    'Immunity2CrestOfDespair': 27,
    'Immunity2CrestOfChaos': 28,
    'Stun': 40,
    'Silence': 41,
    'Sleep': 42,
    'Freeze': 43,
    'Exhaust': 44,
    'Invulnerable': 45,
    'Taunt': 46,
    'Mark': 47,
    'Shield': 48,
    'Bleeding': 60,
    'Delayed': 61,
    'FlatATK': 70,
    'FlatHP': 71,
    'FlatArmor': 72,
    'FlatAttackSpeed': 73,
    'FlatSkillSpeed': 74,
    'PercentATK': 80,
    'PercentHP': 81,
    'PercentArmor': 82,
    'PercentAttackSpeed': 83,
    'PercentSkillSpeed': 84
};
Object.freeze(EffectType);


// Trigger Types
const When = {
    'Dummy': 0,
    'BattleStarted': 1,
    'TurnStarted': 2,
    'OnAttacked': 3,
    'OnStruck': 4,
    'Dodged': 5,
    'CriticalHitDealt': 6,
    'CriticalHitTaken': 7,
    'CounterAttacked': 8,
    'Blocked': 9,
    'Healed': 10,
    'Died': 11,
    'Revived': 12,
    'Killed': 13,
    'Stunned': 14,
    'Stuns': 15,
    'BaseAttacked': 16
};
Object.freeze(When);

// Damage Types
const DamageType = {
    'Normal': 0,
    'Piercing': 1,
    'Leeching': 2,
};
Object.freeze(DamageType);


// Item types
const ItemType = {
    'Weapon': 1,
    'Armor': 2,
    'Accessory': 4,
    'Gem': 8
};
Object.freeze(ItemType);
