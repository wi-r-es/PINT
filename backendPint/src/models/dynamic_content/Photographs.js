module.exports = (sequelize, DataTypes) => {
    const Photographs = sequelize.define('Photographs', {
        photo_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        album_id: { type: DataTypes.INTEGER, allowNull: false },
        publisher_id: { type: DataTypes.INTEGER, allowNull: false },
        filepath: { type: DataTypes.TEXT, allowNull: false },
        upload_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
        schema: 'dynamic_content',
        tableName: 'photographs',
        timestamps: false
    });

    Photographs.associate = function(models) {
        Photographs.belongsTo(models.Albuns, { foreignKey: 'album_id', targetKey: 'album_id', schema: 'dynamic_content' });
        Photographs.belongsTo(models.Users, { foreignKey: 'publisher_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
    };

    return Photographs;
};
