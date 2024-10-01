module.exports = (sequelize, DataTypes) => {
    const Bookmarks = sequelize.define('Bookmarks', {
        bookmark_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        content_id: { type: DataTypes.INTEGER, allowNull: false },
        content_type: { type: DataTypes.STRING(50) },
        bookmark_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
        schema: 'user_interactions',
        tableName: 'bookmarks',
        timestamps: false
    });

    Bookmarks.associate = function(models) {
        Bookmarks.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
    };

    return Bookmarks;
};
