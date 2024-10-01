module.exports = (sequelize, DataTypes) => {
    const Comments = sequelize.define('Comments', {
        comment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        forum_id: { type: DataTypes.INTEGER },
        post_id: { type: DataTypes.INTEGER },
        publisher_id: { type: DataTypes.INTEGER, allowNull: false },
        comment_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        content: { type: DataTypes.TEXT, allowNull: false },
        likes: {type: DataTypes.INTEGER, defaultValue: 0}
    }, {
        schema: 'communication',
        tableName: 'comments',
        timestamps: false
    });

    Comments.associate = function(models) {
        Comments.belongsTo(models.Users, { foreignKey: 'publisher_id', targetKey: 'user_id', schema: 'hr' , onDelete: 'CASCADE' });
        Comments.belongsTo(models.Posts, { foreignKey: 'post_id', targetKey: 'post_id', schema: 'dynamic_content',  onDelete: 'CASCADE' });
        Comments.belongsTo(models.Forums, { foreignKey: 'forum_id', targetKey: 'forum_id', schema: 'dynamic_content',  onDelete: 'CASCADE' });
    };

    return Comments;
};
