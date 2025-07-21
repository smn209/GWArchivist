-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'PLAYER',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guilds
CREATE TABLE guilds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    key BIGINT[],
    tag VARCHAR(10) NOT NULL
);

-- Pseudos
CREATE TABLE pseudos (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GvG Match 
CREATE TABLE gvg_match (
    id SERIAL PRIMARY KEY,
    map_name VARCHAR(255) NOT NULL,
    duration_ut INTEGER NOT NULL,
    winner_guild_id INTEGER REFERENCES guilds(id) ON DELETE SET NULL,
    match_date DATE NOT NULL,
    state INTEGER DEFAULT 0,
    description TEXT,
    vods VARCHAR(255)[],
    flux VARCHAR(255),
    occasion VARCHAR(255),
    match_original_duration VARCHAR(20),
    match_end_time_ms INTEGER,
    match_end_time_formatted VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guild Match States
CREATE TABLE guild_match_states (
    match_id INTEGER NOT NULL REFERENCES gvg_match(id) ON DELETE CASCADE,
    guild_id INTEGER NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    faction INTEGER NOT NULL,
    faction_point INTEGER NOT NULL,
    qualifier_point INTEGER NOT NULL,
    cape_trim INTEGER NOT NULL,
    PRIMARY KEY (match_id, guild_id)
);

-- Match AG Players
CREATE TABLE match_ag_players (
    match_id INTEGER NOT NULL REFERENCES gvg_match(id) ON DELETE CASCADE,
    guild_id INTEGER REFERENCES guilds(id) ON DELETE SET NULL,
    pseudo_id INTEGER NOT NULL REFERENCES pseudos(id) ON DELETE CASCADE,
    primary_stat INTEGER NOT NULL,
    secondary_stat INTEGER NOT NULL,
    level INTEGER,
    team_id INTEGER,
    player_number INTEGER,
    model_id INTEGER,
    gadget_id INTEGER,
    encoded_name VARCHAR(255),
    skill_template_code VARCHAR(255),
    used_skills BIGINT[] NOT NULL,
    PRIMARY KEY (match_id, pseudo_id)
);

-- Match AG Others
CREATE TABLE match_ag_others (
    match_id INTEGER NOT NULL REFERENCES gvg_match(id) ON DELETE CASCADE,
    guild_id INTEGER REFERENCES guilds(id) ON DELETE SET NULL,
    other_id INTEGER NOT NULL,
    primary_stat INTEGER NOT NULL,
    secondary_stat INTEGER NOT NULL,
    level INTEGER,
    team_id INTEGER,
    player_number INTEGER,
    model_id INTEGER,
    gadget_id INTEGER,
    encoded_name VARCHAR(255),
    skill_template_code VARCHAR(255),
    used_skills BIGINT[] NOT NULL,
    PRIMARY KEY (match_id, other_id)
);

-- Match Logs
CREATE TABLE match_logs (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES gvg_match(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    team INTEGER NOT NULL CHECK (team IN (1, 2)),
    data TEXT NOT NULL
);

-- Match Players Data
CREATE TABLE match_players_data (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES gvg_match(id) ON DELETE CASCADE,
    pseudo_id INTEGER NOT NULL REFERENCES pseudos(id) ON DELETE CASCADE,
    data TEXT NOT NULL
);

-- Match Players Stats
CREATE TABLE match_players_stats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES gvg_match(id) ON DELETE CASCADE,
    pseudo_id INTEGER NOT NULL REFERENCES pseudos(id) ON DELETE CASCADE,
    stat VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_guilds_name ON guilds(name);
CREATE INDEX idx_guilds_key ON guilds(key);
CREATE INDEX idx_guilds_tag ON guilds(tag);
CREATE INDEX idx_pseudos_user_id ON pseudos(user_id);
CREATE INDEX idx_match_date ON gvg_match(match_date);
CREATE INDEX idx_match_winner_guild_id ON gvg_match(winner_guild_id);
CREATE INDEX idx_guild_match_states_guild_id ON guild_match_states(guild_id);
CREATE INDEX idx_match_ag_players_guild_id ON match_ag_players(guild_id);
CREATE INDEX idx_match_ag_players_pseudo_id ON match_ag_players(pseudo_id);
CREATE INDEX idx_match_logs_match_id ON match_logs(match_id);
CREATE INDEX idx_match_logs_type ON match_logs(type);
CREATE INDEX idx_match_players_data_match_id ON match_players_data(match_id);
CREATE INDEX idx_match_players_data_pseudo_id ON match_players_data(pseudo_id);
CREATE INDEX idx_match_players_stats_match_id ON match_players_stats(match_id);
CREATE INDEX idx_match_players_stats_pseudo_id ON match_players_stats(pseudo_id);
CREATE INDEX idx_match_players_stats_stat ON match_players_stats(stat);