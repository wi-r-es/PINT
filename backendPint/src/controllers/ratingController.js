const { spInsertEvaluation,
        //trgUpdateAverageScore
  } = require('../database/logic_objects/generalHelpers');

const controllers = {};

controllers.add_evaluation = async (req, res) => { //Only "Post" and "Event" for contentType
    const { contentType, contentId } = req.params; 
    const { evaluation } = req.body;
    const user_id = req.user.id; // Extracted from JWT
    console.log(req.query);
    console.log(req.body);
    try {
        await spInsertEvaluation(contentType, contentId, user_id, evaluation);

        //await trgUpdateAverageScore(evaluation);

        res.status(201).json({success: true ,message:'Eval added successfully.'});
    } catch (error) {
        console.error(error);
        console.log(error.message);
        res.status(500).json({success:false, message:'Error adding eval: ' + error.message});
    }
};




module.exports = controllers;
