module.exports = {
	mandrill : 'qiDZR_J-NKKKfg6ieTPSYw',
	cors : ['http://localhost:1440','http://localhost:1444','https://www.cloudboost.io', 'http://www.cloudboost.io','http://dashboard.cloudboost.io','https://dashboard.cloudboost.io','http://cloudboost.io','https://cloudboost.io'],
	devDb : 'mongodb://CloudBoost:WhiteHouse123@ds030817.mongolab.com:30817/CloudBoostDevDB',
	productionDb : 'mongodb://CloudBoost:WhiteHouse123@ds041177.mongolab.com:41177/CloudBoostProdDB',
	dataServiceUrl : global.isDevelopment ? 'http://localhost' : 'https://api.cloudboost.io',
	dataServiceUrlPort :global.isDevelopment ? 4730 : 80,
	encryptKey: "hackersbay", //for encryption of passwords
	cbDataServicesConnectKey : 'secret-cookie'
};