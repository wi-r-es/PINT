module.exports = (sequelize, DataTypes) => {
    const UserPref = sequelize.define('UserPref', {
        user_id: { type: DataTypes.INTEGER, primaryKey: true },
        notifications_topic: { type: DataTypes.JSONB, allowNull: true },
        receive_notifications: { type: DataTypes.BOOLEAN, allowNull: true },
        language_id: { type: DataTypes.INTEGER , allowNull: true},
        additional_preferences: { type: DataTypes.JSONB, allowNull: true }
    }, {
        schema: 'user_interactions',
        tableName: 'user_pref',
        timestamps: false
    });

    UserPref.associate = function(models) {
        UserPref.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        UserPref.belongsTo(models.Language, { foreignKey: 'language_id', targetKey: 'language_id', schema: 'static_content' });
    };

    return UserPref;
};
