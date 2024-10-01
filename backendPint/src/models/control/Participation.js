module.exports = (sequelize, DataTypes) => {
    const Participation = sequelize.define('Participation', {
        user_id: { type: DataTypes.INTEGER, primaryKey: true },
        event_id: { type: DataTypes.INTEGER, primaryKey: true },
        entry_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
        schema: 'control',
        tableName: 'participation',
        timestamps: false
    });

    Participation.associate = function(models) {
        Participation.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        Participation.belongsTo(models.Events, { foreignKey: 'event_id', targetKey: 'event_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
    };

    return Participation;
};