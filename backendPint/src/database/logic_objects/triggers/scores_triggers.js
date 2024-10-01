
const db = require('../../../models'); 


const createFunction_reverseRating = async () => {
    await db.sequelize.query(`
      CREATE OR REPLACE FUNCTION dynamic_content.fn_reverse_rating(
        avg_rating DECIMAL(3, 1),
        num_of_ratings INT,
        new_rating INT
      )
      RETURNS DECIMAL(10, 1) AS $$
      DECLARE
        total_of_ratings DECIMAL(10, 1);
        new_avg_rating DECIMAL(10, 1);
      BEGIN
        total_of_ratings := avg_rating * num_of_ratings;
        total_of_ratings := total_of_ratings + CAST(new_rating AS DECIMAL(2, 1));
        num_of_ratings := num_of_ratings + 1;
        new_avg_rating := total_of_ratings / num_of_ratings;
        RETURN new_avg_rating;
      END;
      $$ LANGUAGE plpgsql;
    `);
  };
  
  const createTriggerFunction_updateAVG_Score = async () => {
    await db.sequelize.query(`
          CREATE OR REPLACE FUNCTION dynamic_content.trg_update_average_score()
          RETURNS TRIGGER AS $$
          DECLARE
              _event_id INT;
              _post_id INT;
              new_rating INT;
              old_rating INT;
              avg_score DECIMAL(3, 1);
              new_avg_rating DECIMAL(3, 1);
              _num_of_evals INT;
              total_ratings DECIMAL(10, 1);
          BEGIN
              RAISE NOTICE 'Trigger function started for event_id: % and post_id: %', NEW.event_id, NEW.post_id;

              -- Assign values from NEW and OLD to local variables
              _event_id := NEW.event_id;
              _post_id := NEW.post_id;
              new_rating := NEW.evaluation;
              old_rating := COALESCE(OLD.evaluation, NULL);

              BEGIN
                  IF _post_id IS NOT NULL THEN
                      -- Fetch the current average score and number of evaluations for the post
                      SELECT s.score, s.num_of_evals INTO avg_score, _num_of_evals
                      FROM dynamic_content.scores s
                      WHERE s.post_id = _post_id
                      FOR UPDATE;

                      IF _num_of_evals = 0 THEN
                          -- No previous ratings, simply set the new rating
                          new_avg_rating := new_rating;
                          _num_of_evals := 1;
                      ELSE
                          -- If this is an update, adjust the total ratings first by removing the old rating
                          IF TG_OP = 'UPDATE' AND old_rating IS NOT NULL THEN
                              total_ratings := (avg_score * _num_of_evals) - old_rating;
                          ELSE
                              total_ratings := avg_score * _num_of_evals;
                              _num_of_evals := _num_of_evals + 1;
                          END IF;

                          -- Add the new rating to the total and calculate the new average
                          total_ratings := total_ratings + new_rating;
                          new_avg_rating := total_ratings / _num_of_evals;
                      END IF;

                      -- Update the scores table with the new average rating
                      UPDATE dynamic_content.scores 
                      SET score = new_avg_rating,
                          num_of_evals = _num_of_evals
                      WHERE post_id = _post_id;

                  ELSIF _event_id IS NOT NULL THEN
                      -- Fetch the current average score and number of evaluations for the event
                      SELECT s.score, s.num_of_evals INTO avg_score, _num_of_evals
                      FROM dynamic_content.scores s
                      WHERE s.event_id = _event_id
                      FOR UPDATE;

                      IF _num_of_evals = 0 THEN
                          -- No previous ratings, simply set the new rating
                          new_avg_rating := new_rating;
                          _num_of_evals := 1;
                      ELSE
                          -- If this is an update, adjust the total ratings first by removing the old rating
                          IF TG_OP = 'UPDATE' AND old_rating IS NOT NULL THEN
                              total_ratings := (avg_score * _num_of_evals) - old_rating;
                          ELSE
                              total_ratings := avg_score * _num_of_evals;
                              _num_of_evals := _num_of_evals + 1;
                          END IF;

                          -- Add the new rating to the total and calculate the new average
                          total_ratings := total_ratings + new_rating;
                          new_avg_rating := total_ratings / _num_of_evals;
                      END IF;

                      -- Update the scores table with the new average rating
                      UPDATE dynamic_content.scores
                      SET score = new_avg_rating,
                          num_of_evals = _num_of_evals
                      WHERE event_id = _event_id;
                  END IF;

              EXCEPTION
                  WHEN OTHERS THEN
                      RAISE NOTICE 'Error: %', SQLERRM;
                      RETURN NULL;
              END;

              RAISE NOTICE 'Trigger function completed for event_id: % and post_id: %', _event_id, _post_id;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;


      `);
      
//     await db.sequelize.query(`
//         CREATE OR REPLACE FUNCTION dynamic_content.trg_update_average_score()
// RETURNS TRIGGER AS $$
// DECLARE
//     _event_id INT;
//     _post_id INT;
//     rating INT;
//     avg_score DECIMAL(3, 1);
//     new_avg_rating DECIMAL(3, 1);
//     _num_of_evals INT;
//     error_message TEXT;
//     error_severity TEXT;
//     error_state TEXT;
// BEGIN
//     RAISE NOTICE 'Trigger function started for event_id: % and post_id: %', NEW.event_id, NEW.post_id;

//     -- Assign values from NEW to local variables
//     _event_id := NEW.event_id;
//     _post_id := NEW.post_id;
//     rating := NEW.evaluation;

//     BEGIN
//         IF _post_id IS NOT NULL THEN
//             -- Fetch the current average score and number of evaluations for the post
//             SELECT s.score, s.num_of_evals INTO avg_score, _num_of_evals
//             FROM dynamic_content.scores s
//             WHERE s.post_id = _post_id;

//             -- Calculate the new average rating
//             new_avg_rating := dynamic_content.fn_reverse_rating(avg_score, _num_of_evals, rating);

//             -- Update the scores table with the new average rating and increment the number of evaluations
//             UPDATE dynamic_content.scores 
//             SET score = new_avg_rating,
//                 num_of_evals = _num_of_evals + 1
//             WHERE post_id = _post_id;

//         ELSIF _event_id IS NOT NULL THEN
//             -- Fetch the current average score and number of evaluations for the event
//             SELECT s.score, s.num_of_evals INTO avg_score, _num_of_evals
//             FROM dynamic_content.scores s
//             WHERE s.event_id = _event_id;

//             -- Calculate the new average rating
//             new_avg_rating := dynamic_content.fn_reverse_rating(avg_score, _num_of_evals, rating);

//             -- Update the scores table with the new average rating and increment the number of evaluations
//             UPDATE dynamic_content.scores
//             SET score = new_avg_rating,
//                 num_of_evals = _num_of_evals + 1
//             WHERE event_id = _event_id;
//         END IF;

//     EXCEPTION
//         WHEN OTHERS THEN
//             GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT,
//                                     error_severity = RETURNED_SQLSTATE,
//                                     error_state = PG_EXCEPTION_DETAIL;
//             RAISE NOTICE 'Error: %', error_message;
//             RETURN NULL;
//     END;

//     RAISE NOTICE 'Trigger function completed for event_id: % and post_id: %', _event_id, _post_id;
//     RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;


//     `);
};

  

  const createTrigger_score = async () => {
    await db.sequelize.query(`
        DO $$ 
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_average_score') THEN
            DROP TRIGGER trg_update_average_score ON dynamic_content.ratings;
          END IF;
          CREATE TRIGGER trg_update_average_score
          AFTER INSERT OR UPDATE ON dynamic_content.ratings
          FOR EACH ROW
          EXECUTE FUNCTION dynamic_content.trg_update_average_score();
        END $$;
      `);
  };

  module.exports = {
    createFunction_reverseRating,
    createTriggerFunction_updateAVG_Score,
    createTrigger_score
  }