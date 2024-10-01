module.exports = (sequelize, DataTypes) => {
    const Scores = sequelize.define('Scores', {
        avg_rating_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        event_id: { type: DataTypes.INTEGER },
        post_id: { type: DataTypes.INTEGER },
        score: { type: DataTypes.DECIMAL(2,1), allowNull: false, defaultValue: 0.0 },
        num_of_evals: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    }, {
        schema: 'dynamic_content',
        tableName: 'scores',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['event_id', 'post_id'],
                name: 'unique_event_post'
            }
        ]
    });

    Scores.associate = function(models) {
        Scores.belongsTo(models.Posts, { foreignKey: 'post_id', targetKey: 'post_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
        Scores.belongsTo(models.Events, { foreignKey: 'event_id', targetKey: 'event_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
    };

    return Scores;
};
