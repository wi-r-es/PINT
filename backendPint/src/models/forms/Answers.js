module.exports = (sequelize, DataTypes) => {
    const Answers = sequelize.define('Answers', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        event_id: { type: DataTypes.INTEGER, allowNull: false },
        field_id: { type: DataTypes.INTEGER, allowNull: false },
        answer: { type: DataTypes.TEXT, allowNull: false },
        entry_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
        schema: 'forms',
        tableName: 'answers',
        timestamps: false
    });

    Answers.associate = function(models) {
        Answers.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        Answers.belongsTo(models.Fields, { foreignKey: 'field_id', targetKey: 'field_id', schema: 'forms' });
        Answers.belongsTo(models.Events, { foreignKey: 'event_id', targetKey: 'event_id', schema: 'dynamic_content' });
    };

    return Answers;
};
