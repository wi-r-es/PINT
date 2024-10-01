module.exports = (sequelize, DataTypes) => {
    const EventForumAccess = sequelize.define('EventForumAccess', {
        user_id: { type: DataTypes.INTEGER, primaryKey: true },
        forum_id: { type: DataTypes.INTEGER, primaryKey: true }
    }, {
        schema: 'control',
        tableName: 'event_forum_access',
        timestamps: false
    });

    EventForumAccess.associate = function(models) {
        EventForumAccess.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        EventForumAccess.belongsTo(models.Forums, { foreignKey: 'forum_id', targetKey: 'forum_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
    };

    return EventForumAccess;
};
