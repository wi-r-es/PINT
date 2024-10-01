module.exports = (sequelize, DataTypes) => {
    const UserActionsLog = sequelize.define('UserActionsLog', {
        log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        action_type: { type: DataTypes.STRING(50), allowNull: false },
        action_description: { type: DataTypes.STRING(255), allowNull: false },
        action_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
        schema: 'user_interactions',
        tableName: 'user_actions_log',
        timestamps: false
    });

    UserActionsLog.associate = function(models) {
        UserActionsLog.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
    };

    return UserActionsLog;
};
