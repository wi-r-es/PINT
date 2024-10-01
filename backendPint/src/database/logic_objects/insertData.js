
const db = require('../../models'); 


async function bulkInsert() {

    await db.sequelize.query(`
        INSERT INTO "static_content"."language" ("language_id", "language_code", "language_name")
        VALUES
        (1, 'PT', 'Portuguese'),
        (2, 'ES', 'Spanish'),
        (3, 'FR', 'French')
        ON CONFLICT (language_id) DO NOTHING;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."area" ("area_id", "title", "icon_name")
        VALUES
        (100, 'Health', 'health.png'),
        (200, 'Education', 'education.png'),
        (300, 'Sports', 'sports.png'),
        (400, 'Gastronomy', 'gastronomy.png'),
        (500, 'Housing', 'housing.png'),
        (600, 'Leisure', 'leisure.png'),
        (700, 'Transportation', 'transportation.png')
        ON CONFLICT (area_id) DO NOTHING;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."sub_area" ("sub_area_id", "area_id", "title") 
        VALUES
        (1001, 100, 'Hospitals'),
        (1002, 100, 'Clinics'),
        (1003, 100, 'Pharmacies')
        ON CONFLICT (sub_area_id) DO NOTHING;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."sub_area" ("sub_area_id", "area_id", "title") 
        VALUES
        (2001, 200, 'Schools'),
        (2002, 200, 'Colleges'),
        (2003, 200, 'Libraries')
        ON CONFLICT (sub_area_id) DO NOTHING;;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."sub_area" ("sub_area_id", "area_id", "title") 
        VALUES
        (3001, 300, 'Gyms'),
        (3002, 300, 'Stadiums'),
        (3003, 300, 'Parks')
        ON CONFLICT (sub_area_id) DO NOTHING;;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."sub_area" ("sub_area_id", "area_id", "title") 
        VALUES
        (4001, 400, 'Restaurants'),
        (4002, 400, 'Cafes'),
        (4003, 400, 'Bars')
        ON CONFLICT (sub_area_id) DO NOTHING;;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."sub_area" ("sub_area_id", "area_id", "title") 
        VALUES
        (5001, 500, 'Apartments'),
        (5002, 500, 'Villas'),
        (5003, 500, 'Dormitories')
        ON CONFLICT (sub_area_id) DO NOTHING;;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."sub_area" ("sub_area_id", "area_id", "title") 
        VALUES
        (6001, 600, 'Cinemas'),
        (6002, 600, 'Theaters'),
        (6003, 600, 'Amusement Parks')
        ON CONFLICT (sub_area_id) DO NOTHING;;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."sub_area" ("sub_area_id", "area_id", "title") 
        VALUES
        (7001, 700, 'Buses'),
        (7002, 700, 'Trains'),
        (7003, 700, 'Airports'),
        (7004, 700, 'Hitchride')
        ON CONFLICT (sub_area_id) DO NOTHING;;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."area_content" ("area_id", "language_id", "translated_title")
        VALUES
        (100, 1, 'Saúde'),
        (100, 3, 'Santé'),
        (200, 1, 'Educação'),
        (200, 3, 'Éducation'),
        (300, 1, 'Desportos'),
        (300, 2, 'Esportes'),
        (400, 1, 'Gastronomia'),
        (400, 3, 'Gastronomie'),
        (500, 1, 'Habitação'),
        (500, 3, 'Logement'),
        (600, 1, 'Lazer'),
        (600, 3, 'Loisirs'),
        (700, 2, 'Transporte'),
        (700, 3, 'Transport')
        ON CONFLICT (translated_title) DO NOTHING;
    `);
    await db.sequelize.query(`
        INSERT INTO "static_content"."sub_area_content" ("sub_area_id", "language_id", "translated_title")
        VALUES
        (1001, 1, 'Hospitais'),
        (1001, 3, 'Hôpitaux'),
        (1002, 1, 'Clínicas'),
        (1002, 3, 'Cliniques'),
        (1003, 1, 'Farmácias'),
        (1003, 3, 'Pharmacies'),
        (2001, 1, 'Escolas'),
        (2001, 3, 'Écoles'),
        (3001, 1, 'Ginásios'),
        (3001, 3, 'Gymnases'),
        (4001, 1, 'Restaurantes'),
        (4001, 3, 'Restaurants'),
        (5001, 1, 'Apartamentos'),
        (5001, 3, 'Appartements'),
        (6001, 1, 'Cinemas'),
        (6001, 3, 'Cinémas'),
        (7001, 1, 'Autocarro'),
        (7001, 3, 'Bus'),
        (7002, 1, 'Comboios'),
        (7002, 3, 'Trains'),
        (7003, 1, 'Aeroportos'),
        (7003, 3, 'Aéroports')
        ON CONFLICT (translated_title) DO NOTHING;
    `);
    await db.sequelize.query(`
        INSERT INTO "hr"."users" ("user_id","first_name", "last_name", "email", "join_date", "role_id")
        VALUES 
        (1,'John', 'Doe', 'john.doe@example.com', '2023-01-15', 1),
        (2,'Jane', 'Smith', 'jane.smith@example.com', '2023-02-20', 2),
        (3,'Emily', 'Johnson', 'emily.johnson@example.com', '2023-03-25', 2),
        (4,'Michael', 'Brown', 'michael.brown@example.com', '2023-04-30', 2),
        (5,'Sarah', 'Davis', 'sarah.davis@example.com', '2023-05-15', 2),
        (6,'David', 'Miller', 'david.miller@example.com', '2023-06-10', 1),
        (7,'Linda', 'Wilson', 'linda.wilson@example.com', '2023-07-05', 1),
        (8,'James', 'Moore', 'james.moore@example.com', '2023-08-01', 2),
        (9,'Barbara', 'Taylor', 'barbara.taylor@example.com', '2023-09-10', 1),
        (10,'Richard', 'Anderson', 'richard.anderson@example.com', '2023-10-20', 1),
        (11,'Guilhermo', 'Pedrinho', 'pv25215@alunos.estgv.ipv.pt', '2024-06-22', 3),
        (12,'Jose', 'Machado', 'pv26900@alunos.estgv.ipv.pt', '2024-06-22', 3),
        (13,'Filipe', 'Correia', 'pv25005@alunos.estgv.ipv.pt', '2024-6-22', 3),
        (14,'Tio', 'Patinhas', 'tio.patinhas@examples.com', '2024-06-22', 3),
        (15,'CENTRAL', 'ADMIN', 'god@example.com', '2023-01-15', 3)
        ON CONFLICT (email) DO NOTHING;
    `);
    await db.sequelize.query(`
        ALTER SEQUENCE hr.users_user_id_seq RESTART WITH 16;  
    `)


    await db.sequelize.query(`
        INSERT INTO "user_interactions"."user_actions_log" ("user_id", "action_type", "action_description", "action_date")
        VALUES
        (1, 'Login', 'User logged in', '2023-01-15 08:00:00'),
        (2, 'View', 'User viewed dashboard', '2023-02-20 09:00:00'),
        (3, 'Edit', 'User edited profile', '2023-03-25 10:00:00'),
        (4, 'Logout', 'User logged out', '2023-04-30 11:00:00'),
        (5, 'Login', 'User logged in', '2023-05-15 08:30:00'),
        (6, 'View', 'User viewed reports', '2023-06-10 09:30:00'),
        (7, 'Edit', 'User edited settings', '2023-07-05 10:30:00'),
        (8, 'Logout', 'User logged out', '2023-08-01 11:30:00'),
        (9, 'Login', 'User logged in', '2023-09-10 08:15:00'),
        (10, 'View', 'User viewed notifications', '2023-10-20 09:15:00');
    `);
    await db.sequelize.query(`
        INSERT INTO "security"."user_account_details" ("user_id", "account_status", "account_restriction")
        VALUES
        (1, true, false),
        (2, true, false),
        (3, false, false),
        (4, true, true),
        (5, true, false),
        (6, false, true),
        (7, true, false),
        (8, false, false),
        (9, true, false),
        (10, true, true)
        ON CONFLICT (user_id) DO NOTHING;
    `);
    
    await db.sequelize.query(`
        INSERT INTO "centers"."office_admins" ("office_id", "manager_id")
        VALUES
        (0, 11),
        (0, 12),
        (0, 13),
        (0, 14),
        (1, 2),
        (2, 3),
        (3, 4),
        (4, 5),
        (5, 8)
        ON CONFLICT ("office_id", "manager_id") DO NOTHING;    
    `);
    await db.sequelize.query(`
        INSERT INTO "centers"."office_workers" ("office_id", "user_id")
        VALUES
        (0, 11),
        (0, 12),
        (0, 13),
        (1, 14),
        (1, 2),
        (2, 3),
        (3, 4),
        (4, 5),
        (5, 8),
        (1, 1),
        (2, 6),
        (3, 7),
        (4, 9),
        (4, 10)
        ON CONFLICT ("office_id", "user_id") DO NOTHING;  
    `);
    // await db.sequelize.query(`
    //     INSERT INTO "user_interactions"."user_pref" ("user_id", "areas", "sub_areas", "receive_notifications", "language_id")
    //     VALUES
    //     (1, '[100,200]', '[1001,2001]', true, 1),
    //     (2, '[300,400]', '[3001,4001]', true, 2),
    //     (3, '[500,600]', '[5001,6001]', false, 3),
    //     (4, '[700,400]', '[7001,2001]', true, 1),
    //     (5, '[500,100]', '[2001,4001]', false, 1),
    //     (6, '[100,300]', '[1001,3001]', true, 1),
    //     (7, '[200,400]', '[2001,4001]', false, 2),
    //     (8, '[500,200]', '[5001,7001]', true, 2),
    //     (9, '[600,100]', '[6001,3001]', false, 3),
    //     (10, '[500,100]', '[2001,1001]', true, 3)
    //     ON CONFLICT ("user_id") DO NOTHING; 
    // `);
    await db.sequelize.query(`
        INSERT INTO "dynamic_content"."posts" ("sub_area_id", "office_id", "publisher_id", "title", "content", "p_location","creation_date", "validated")
        VALUES
        (1001, 2, 2, 'CUF', 'This is a description', '40.64538746001789 -7.911339742327035' ,CURRENT_TIMESTAMP, true),
        (2002, 2, 3, 'ESTGV', 'I have finally finished my degree!!','40.64428390013725 -7.920937078897956',CURRENT_TIMESTAMP, true),
        (3001, 3, 4, 'Crossfit in Fundão', 'Link to gym: ','40.19671415803123 -7.486179137001208',CURRENT_TIMESTAMP, true),
        (5001, 4, 6, 'One Bedroom', 'One bedroom apartment in the center of the city for rent','39.606339401281865 -8.420089558257569',CURRENT_TIMESTAMP, true),
        (6001, 2, 7, 'Cinemas', 'Forum Viseu is going to display Star Wars the original trilogy','40.6619963279803 -7.914111529651657',CURRENT_TIMESTAMP, true),
        (7001, 2, 8, 'Flixbus Strike', 'On the 9th of August, flixbus will be on strike','40.661834384758485 -7.915667269409799',CURRENT_TIMESTAMP, true),
        (6003, 2, 9, 'Ottieland', 'Ottieland returns for one more year','40.660851335604924 -7.899651358488228',CURRENT_TIMESTAMP, true),
        (4003, 2, 10, 'Capuchinho', 'Capuchinho bakery turns 75 years old','40.65835162925675 -7.914251302670703',CURRENT_TIMESTAMP, true),
        (3002, 1, 1, 'Estádio Municipal António Fortes (Totói)', 'The Municipal Stadium Tomar hosts the final of the junior league','39.60642642032696 -8.411791987019729',CURRENT_TIMESTAMP, true);
    `);
    await db.sequelize.query(`
        INSERT INTO "dynamic_content"."posts" ("sub_area_id", "office_id", "publisher_id", "title", "content", "type", "creation_date", "validated")
        VALUES
        (4002, 4, 5, 'Neon Byte Bistro', 'Restaurant with a cyberpunk theme', 'P',CURRENT_TIMESTAMP, true);
    `);
    await db.sequelize.query(`
        INSERT INTO "dynamic_content"."events" ("publisher_id", "office_id", "sub_area_id", "name", "description", "event_location","event_date", "recurring","creation_date", "validated", "start_time", "end_time")
        VALUES
        (1, 2, 1001, 'Volunteering', 'Viseu hospital will be hosting an auction to gain funding for children in need', '40.65056885039045 -7.905631258488603','2023-11-15', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00'),
        (2, 2, 2001, 'Marathon', 'Next Friday Alves Martins school will host a marathon in support of cancer', '40.65434224001848 -7.916687987324942','2023-12-01', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00'),
        (3, 3, 3002, 'Football tournament', 'Every Sunday we will be playing football until the end of the tournament', '40.146181639547116 -7.483017349363566','2023-12-10', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00'),
        (4, 2, 4003, 'Rafael Mariano Live', 'Rafael Mariano will be hosting a live show in Old School Bar','40.11331582264235 -7.600471037595766' ,'2023-12-31', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00'),
        (5, 5, 6002, 'The Lord Of the Rings live', 'Nosso Shopping will be playing the OST of The Lord of the Rings with the movie', '41.29696712221882 -7.734768146829981','2024-01-05', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00'),
        (6, 1, 4001, 'Company dinner', 'We are celebrating a closed deal and will be having dinner at Canoa Wine Bar', '39.6048610997216 -8.414854011912372','2024-01-15', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00'),
        (7, 4, 2003, 'Live Reading', 'The library will be having a live reading directed to children', '39.29030284651063 -7.432249675738156' ,'2024-01-25', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00'),
        (8, 3, 1002, 'Donate Blood', 'Local pharmacy will be collecting blood for charity purposes', '40.13969717714694 -7.671405025696972','2024-02-05', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00'),
        (9, 4, 2002, 'Tecnico Open Day', 'Técnico will open its doors for everyone', '39.291450016171346 -7.43306862970031','2024-02-15', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00'),
        (10, 5, 3001, 'Workout competition', 'Fitness hut is opening a tournament and the prize is a free membership for a year', '41.29319651421935 -7.737093562591062','2024-03-01', false,CURRENT_TIMESTAMP, true, '12:00:00', '14:00:00');
    `);
    await db.sequelize.query(`
        INSERT INTO "dynamic_content"."forums" ("publisher_id", "office_id", "sub_area_id", "title", "content","creation_date", "validated")
        VALUES
        (1, 1, 4002, 'Coffee Shops', 'Can someone recommend coffee shops with a "hippie" vibe?',CURRENT_TIMESTAMP, true),
        (2, 2, 2002, 'Best colleges in the country?', 'Trying to get a new degree in a new school, what are the best options',CURRENT_TIMESTAMP, true),
        (3, 3, 4001, 'Anniversary Dinner', 'Want to take my SO somewhere nice, what do you guys recommend?',CURRENT_TIMESTAMP, true),
        (4, 4, 6001, 'Top 3 movies', 'Tell me your top 3 movies of all time. Mine are 1.Return of the king 2.Blade Runner 1982 3. Hacksaw Ridge',CURRENT_TIMESTAMP, true),
        (5, 5, 3003, 'Parks to walk the dog?', 'Need a good park to walk my dog. Any recommendations',CURRENT_TIMESTAMP, true),
        (6, 1, 7004, 'Need a lift', 'Need a lift to my house in UnicornLand, can someone give me a lift?',CURRENT_TIMESTAMP, true),
        (7, 2, 7003, 'Airplane ticket', 'I bought these airplane tickets, does anyone want them?',CURRENT_TIMESTAMP, true),
        (8, 3, 4002, 'Baking a red velvet', 'I am having a hard time in the 3rd step of the mixture of the ingredients, can someone help me?',CURRENT_TIMESTAMP, true),
        (9, 4, 5001, 'Looking for a studio', 'Does anyone know a good landlord who rents studios at an affordable price and good conditions?',CURRENT_TIMESTAMP, true),
        (10, 5, 1002, 'Need counseling', 'I am looking for a good psychologist for my oldest son, does anyone have a recommendation? Thank you all!',CURRENT_TIMESTAMP, true);
    `);
    await db.sequelize.query(`
        INSERT INTO "user_interactions"."notifications" ("user_id", "event_id", "post_id", "notification_text","create_date")
        VALUES
        (1, 1, NULL, 'You have a new event: Volunteering.',CURRENT_TIMESTAMP),
        (2, 2, NULL, 'You have a new event: Marathon.',CURRENT_TIMESTAMP),
        (3, 3, NULL, 'You have a new event: Football tournament.',CURRENT_TIMESTAMP),
        (4, 4, NULL, 'You have a new event: Rafael Mariano Live.',CURRENT_TIMESTAMP),
        (5, 5, NULL, 'You have a new event: The Lord Of the Rings live.',CURRENT_TIMESTAMP),
        (6, 6, NULL, 'You have a new event: Company dinner.',CURRENT_TIMESTAMP),
        (7, 7, NULL, 'You have a new event: Live Reading.',CURRENT_TIMESTAMP),
        (8, 8, NULL, 'You have a new event: Donate Blood.',CURRENT_TIMESTAMP),
        (9, 9, NULL, 'You have a new event: Tecnico Open Day.',CURRENT_TIMESTAMP),
        (10, 10, NULL, 'You have a new event: Workout competition.',CURRENT_TIMESTAMP);
    `);
    await db.sequelize.query(`
        INSERT INTO "forms"."default_fields" ("field_id","field_name", "field_type", "field_value")
        VALUES
        (1,'First Name', 'Text', ''),
        (2,'Last Name', 'Text', ''),
        (3,'Age', 'Int', '0'),
        (4,'Date of Birth', 'Date', '1970-01-01'),
        (5,'Gender', 'Check Box', '[M,F,O]'),
        (6,'Agree to Terms', 'Checkbox', '[Y,N]')
        ON CONFLICT ("field_id") DO NOTHING; 
    `);

    await db.sequelize.query(`
        UPDATE "centers"."offices"
        SET "officeImage" = CASE
            WHEN office_id = 1 THEN 'tomar.jpeg'
            WHEN office_id = 2 THEN 'viseu.jpeg'
            WHEN office_id = 3 THEN 'fundao.jpeg'
            WHEN office_id = 4 THEN 'portalegre.jpeg'
            WHEN office_id = 5 THEN 'vila-real.jpeg'
            ELSE "officeImage"
        END
        WHERE office_id IN (1, 2, 3, 4, 5);
    `);

    await db.sequelize.query(`
        INSERT INTO "dynamic_content"."albuns" ("area_id", "title")
        VALUES
        (100, 'Health'),
        (200, 'Education'),
        (300, 'Sports'),
        (400, 'Gastronomy'),
        (500, 'Housing'),
        (600, 'Leisure'),
        (700, 'Transportation');
    `);
    
    
}

bulkInsert();



    

