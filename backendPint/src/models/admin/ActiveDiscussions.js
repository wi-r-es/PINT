module.exports = (sequelize, DataTypes) => {
    const ActiveDiscussions = sequelize.define('ActiveDiscussions', {
        discussion_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        forum_id: { type: DataTypes.INTEGER, allowNull: false },
        last_activity_date: { type: DataTypes.DATE },
        active_participants: { type: DataTypes.INTEGER }
    }, {
        schema: 'admin',
        tableName: 'active_discussions',
        timestamps: false
    });

    ActiveDiscussions.associate = function(models) {
        ActiveDiscussions.belongsTo(models.Forums, { foreignKey: 'forum_id', targetKey: 'forum_id', schema: 'dynamic_content' });
    };

    return ActiveDiscussions;
};
