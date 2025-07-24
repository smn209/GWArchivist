CREATE DATABASE IF NOT EXISTS gwarchivist;

CREATE TABLE users (
    id UInt32,
    username String,
    email Nullable(String),
    password_hash String,
    role LowCardinality(String) DEFAULT 'PLAYER',
    last_login Nullable(DateTime),
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY id
SETTINGS index_granularity = 8192;

CREATE TABLE guilds (
    id UInt32,
    name String,
    tag String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY id
SETTINGS index_granularity = 8192;

CREATE TABLE pseudos (
    id UInt32,
    pseudo String,
    user_id Nullable(UInt32),
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY id
SETTINGS index_granularity = 8192;


CREATE TABLE gvg_matches (
    match_id UInt64,
    map_id UInt32,
    map_name LowCardinality(String),
    flux LowCardinality(String),
    occasion LowCardinality(String),
    match_date Date,
    match_datetime DateTime,
    duration_seconds UInt32,
    duration_formatted String,
    match_original_duration String,
    match_end_time_ms UInt32,
    match_end_time_formatted String,
    winner_party_id UInt8,
    winner_guild_id UInt32,
    guild1_id UInt32,
    guild1_name String,
    guild1_tag String,
    guild1_rank UInt32,
    guild1_rating UInt32,
    guild1_faction UInt8,
    guild1_faction_points UInt32,
    guild1_qualifier_points UInt32,
    guild2_id UInt32,
    guild2_name String,
    guild2_tag String,
    guild2_rank UInt32,
    guild2_rating UInt32,
    guild2_faction UInt8,
    guild2_faction_points UInt32,
    guild2_qualifier_points UInt32,
    state UInt8 DEFAULT 0,
    description Nullable(String),
    vods Array(String),
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(match_date)
ORDER BY (match_date, match_id)
SETTINGS index_granularity = 8192;
-- match_id is generated at insert using generateSerialID('gvg_match_id')

ALTER TABLE gvg_matches ADD INDEX idx_guild1 guild1_id TYPE minmax GRANULARITY 1;
ALTER TABLE gvg_matches ADD INDEX idx_guild2 guild2_id TYPE minmax GRANULARITY 1;
ALTER TABLE gvg_matches ADD INDEX idx_map_name map_name TYPE set(100) GRANULARITY 1;
ALTER TABLE gvg_matches ADD INDEX idx_flux flux TYPE set(50) GRANULARITY 1;
ALTER TABLE gvg_matches ADD INDEX idx_occasion occasion TYPE set(100) GRANULARITY 1;

CREATE TABLE match_players (
    match_id UInt64,
    agent_id UInt32,
    pseudo_id UInt32,
    pseudo_name String,
    guild_id UInt32,
    team_id UInt8,
    party_id UInt8,
    player_number UInt8,
    model_id UInt32,
    gadget_id UInt32,
    primary_profession UInt8,
    secondary_profession UInt8,
    level UInt8,
    encoded_name String,
    skill_template_code String,
    used_skills Array(UInt32),
    match_date Date,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(match_date)
ORDER BY (match_date, match_id, agent_id)
SETTINGS index_granularity = 8192;

ALTER TABLE match_players ADD INDEX idx_pseudo_id pseudo_id TYPE minmax GRANULARITY 1;
ALTER TABLE match_players ADD INDEX idx_guild_id guild_id TYPE minmax GRANULARITY 1;
ALTER TABLE match_players ADD INDEX idx_used_skills used_skills TYPE bloom_filter GRANULARITY 1;

CREATE TABLE match_npcs (
    match_id UInt64,
    agent_id UInt32,
    team_id UInt8,
    model_id UInt32,
    gadget_id UInt32,
    primary_profession UInt8,
    secondary_profession UInt8,
    level UInt8,
    encoded_name LowCardinality(String),
    skill_template_code String,
    used_skills Array(UInt32),
    match_date Date,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(match_date)
ORDER BY (match_date, match_id, agent_id)
SETTINGS index_granularity = 8192;

CREATE TABLE agent_states (
    match_id UInt64,
    agent_id UInt32,
    timestamp_ms UInt32,
    timestamp_formatted String,
    x Float32,
    y Float32,
    z Float32,
    rotation_angle Float32,
    weapon_id UInt32,
    model_id UInt32,
    gadget_id UInt32,
    is_alive UInt8,
    is_dead UInt8,
    health_pct Float32,
    is_knocked UInt8,
    max_hp UInt32,
    has_condition UInt8,
    has_deep_wound UInt8,
    has_bleeding UInt8,
    has_crippled UInt8,
    has_blind UInt8,
    has_poison UInt8,
    has_hex UInt8,
    has_degen_hex UInt8,
    has_enchantment UInt8,
    has_weapon_spell UInt8,
    is_holding UInt8,
    is_casting UInt8,
    skill_id UInt32,
    weapon_item_type UInt8,
    offhand_item_type UInt8,
    weapon_item_id UInt16,
    offhand_item_id UInt16,
    move_x Float32,
    move_y Float32,
    visual_effects UInt16,
    team_id UInt8,
    weapon_type UInt16,
    weapon_attack_speed Float32,
    attack_speed_modifier Float32,
    dagger_status UInt8,
    hp_pips Float32,
    model_state UInt32,
    animation_code UInt32,
    animation_id UInt32,
    animation_speed Float32,
    animation_type Float32,
    in_spirit_range UInt32,
    agent_model_type UInt16,
    item_id UInt32,
    item_extra_type UInt32,
    gadget_extra_type UInt32,
    match_date Date
) ENGINE = MergeTree()
PARTITION BY (toYYYYMM(match_date), match_id)
ORDER BY (match_date, match_id, agent_id, timestamp_ms)
SETTINGS index_granularity = 8192;

ALTER TABLE agent_states ADD INDEX idx_skill_id skill_id TYPE minmax GRANULARITY 1;
ALTER TABLE agent_states ADD INDEX idx_is_casting is_casting TYPE set(2) GRANULARITY 1;

CREATE TABLE skill_events (
    match_id UInt64,
    timestamp_ms UInt32,
    timestamp_formatted String,
    event_type LowCardinality(String), 
    skill_id UInt32,
    caster_id UInt32,
    target_id UInt32,
    match_date Date
) ENGINE = MergeTree()
PARTITION BY (toYYYYMM(match_date), match_id)
ORDER BY (match_date, match_id, timestamp_ms, caster_id)
SETTINGS index_granularity = 8192;

ALTER TABLE skill_events ADD INDEX idx_skill_id skill_id TYPE minmax GRANULARITY 1;
ALTER TABLE skill_events ADD INDEX idx_event_type event_type TYPE set(20) GRANULARITY 1;
ALTER TABLE skill_events ADD INDEX idx_caster_id caster_id TYPE minmax GRANULARITY 1;

CREATE TABLE combat_events (
    match_id UInt64,
    timestamp_ms UInt32,
    timestamp_formatted String,
    event_type LowCardinality(String), 
    caster_id UInt32,
    target_id UInt32,
    skill_id UInt32,
    value Float32, 
    damage_type UInt8, 
    extra_data String, 
    match_date Date
) ENGINE = MergeTree()
PARTITION BY (toYYYYMM(match_date), match_id)
ORDER BY (match_date, match_id, timestamp_ms, caster_id)
SETTINGS index_granularity = 8192;

ALTER TABLE combat_events ADD INDEX idx_event_type event_type TYPE set(20) GRANULARITY 1;
ALTER TABLE combat_events ADD INDEX idx_caster_id caster_id TYPE minmax GRANULARITY 1;
ALTER TABLE combat_events ADD INDEX idx_target_id target_id TYPE minmax GRANULARITY 1;

CREATE TABLE movement_events (
    match_id UInt64,
    timestamp_ms UInt32,
    timestamp_formatted String,
    event_type LowCardinality(String), 
    agent_id UInt32,
    x_coord Float32,
    y_coord Float32,
    plane UInt8,
    match_date Date
) ENGINE = MergeTree()
PARTITION BY (toYYYYMM(match_date), match_id)
ORDER BY (match_date, match_id, timestamp_ms, agent_id)
SETTINGS index_granularity = 8192;

CREATE TABLE jumbo_messages (
    match_id UInt64,
    timestamp_ms UInt32,
    timestamp_formatted String,
    message_type LowCardinality(String), 
    message String,
    party_value UInt32,
    match_date Date
) ENGINE = MergeTree()
PARTITION BY (toYYYYMM(match_date), match_id)
ORDER BY (match_date, match_id, timestamp_ms)
SETTINGS index_granularity = 8192;
