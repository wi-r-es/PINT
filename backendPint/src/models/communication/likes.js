module.exports = (sequelize, DataTypes) => {
    const Likes = sequelize.define('Likes', {
        like_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        comment_id: { type: DataTypes.INTEGER },
        publisher_id: { type: DataTypes.INTEGER, allowNull: false },
        like_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    }, {
        schema: 'communication',
        tableName: 'likes',
        timestamps: false
    });

    Likes.associate = function(models) {
        Likes.belongsTo(models.Users, { foreignKey: 'publisher_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        Likes.belongsTo(models.Comments, { foreignKey: 'comment_id', targetKey: 'comment_id', schema: 'communication',  onDelete: 'CASCADE' });
    };

    return Likes;
};
