module.exports = function(sequelize, DataTypes) {
  var Listing = sequelize.define("listing", {
    imageName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    }
  });
  return Listing
};