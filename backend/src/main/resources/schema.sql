CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
                       id SERIAL PRIMARY KEY,
                       username VARCHAR(255) NOT NULL UNIQUE,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       image_url TEXT,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS poi (
                     id SERIAL PRIMARY KEY,
                     name VARCHAR(255) NOT NULL,
                     location GEOMETRY(Point, 4326) NOT NULL,
                     poi_type VARCHAR(50) NOT NULL,
                     category VARCHAR(100) NOT NULL,
                     notes TEXT,
                     is_active BOOLEAN DEFAULT true,
                     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                     deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS trips (
                       id SERIAL PRIMARY KEY,
                       user_id INTEGER REFERENCES users(id),
                       name VARCHAR(255) NOT NULL,
                       start_date DATE,
                       end_date DATE,
                       total_budget DECIMAL(10,2),
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_accommodation (
                                    id SERIAL PRIMARY KEY,
                                    trip_id INTEGER REFERENCES trips(id),
                                    poi_id INTEGER REFERENCES poi(id),
                                    check_in_date DATE NOT NULL,
                                    check_out_date DATE NOT NULL,
                                    notes TEXT,
                                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                    UNIQUE(trip_id, check_in_date)
);

CREATE TABLE IF NOT EXISTS trip_points (
                             id SERIAL PRIMARY KEY,
                             trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
                             day_number INTEGER,
                             visit_order INTEGER,
                             point_type VARCHAR(50),
                             planned_duration INTEGER,
                             planned_time TIME,
                             notes TEXT,
                             created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             location GEOMETRY(Point, 4326) NOT NULL,
                             location_name VARCHAR(255)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_poi_location ON poi USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_points_trip ON trip_points(trip_id);