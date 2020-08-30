const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/checkAuth');
const universalPaginator = require('../middleware/universalPaginator');
const validationErrorHandler = require('../middleware/validationErrorHandler');
const checkApprovalStatus = require('../middleware/checkApprovalStatus');
const statusUpdate = require('../middleware/statusUpdate');
const statusRevert = require('../middleware/statusRevert');
const fileDownloadAuth = require('../middleware/fileDownloadAuth');
const determineExcelFields = require('../middleware/determineExcelFields');
const determinePdfFields = require('../middleware/determinePdfFields');
const validators = require('../middleware/validators');

const staffController = require('../controllers/staffController');
const customerController = require('../controllers/customerController');
const warehouseController = require('../controllers/warehouseController');
const tariffController = require('../controllers/tariffController');
const orderController = require('../controllers/orderController');
const personController = require('../controllers/personController');
const siteController = require('../controllers/siteController');

router.get('/staff/all', staffController.viewAll);
router.post('/staff/signup', [
	...validators.person, 
	...validators.constructors.password("password"), 
	...validators.staff
], validationErrorHandler, staffController.register);
router.post('/staff/login', validators.login, validationErrorHandler, staffController.login);
router.put('/staff/data/alter', [
	...validators.person,
	...validators.constructors.password("oldPassword"),
	...validators.constructors.password("newPassword")
], validationErrorHandler, checkAuth, staffController.alter);
router.post('/staff/client/message/send', validators.clientMessage, validationErrorHandler, staffController.clientMessage);

router.get('/customer/all', customerController.viewAll);
router.post('/customer/signup', [
	...validators.person,
	...validators.constructors.password("password"),
	...validators.customer
], validationErrorHandler, customerController.register);
router.post('/customer/login', validators.login, validationErrorHandler, customerController.login);
router.put('/customer/data/alter', [
	...validators.person,
	...validators.constructors.password("oldPassword"),
	...validators.constructors.password("newPassword"),
	...validators.customer
], validationErrorHandler, checkAuth, customerController.alter);
router.get('/customer/dataset', validators.dates, validationErrorHandler, customerController.dataset);

router.get('/warehouse/all', warehouseController.viewAll);
router.post('/warehouse/create', validators.warehouse, validationErrorHandler, warehouseController.create);
router.put('/warehouse/update', validators.warehouse, validationErrorHandler, warehouseController.update);
router.delete('/warehouse/delete', warehouseController.delete);

router.get('/tariff/all', tariffController.viewAll);
router.post('/tariff/create', validators.tariff, validationErrorHandler, tariffController.create);
router.put('/tariff/update', validators.tariff, validationErrorHandler, tariffController.update);
router.delete('/tariff/delete', validators.delete.tariff, validationErrorHandler, tariffController.delete);

router.get('/order/all', orderController.viewAll);
router.post('/order/create', checkAuth, validators.order.create, validationErrorHandler, orderController.create);
router.patch('/order/update/basicinfo', checkApprovalStatus, orderController.update.basicInfo);
router.patch('/order/update/approval', validators.order.update.approval, validationErrorHandler, checkApprovalStatus, orderController.update.approval);
router.patch('/order/update/tariff', validators.order.update.tariff, validationErrorHandler, checkApprovalStatus, orderController.update.tariff);
router.patch('/order/update/merch', validators.order.update.merch, validationErrorHandler, checkApprovalStatus, orderController.update.merch);
router.post('/order/:id/update/status', checkAuth, statusUpdate, orderController.update.status.next);
router.post('/order/:id/revert/status', checkAuth, statusRevert, orderController.update.status.previous);
router.get('/order/stats/excel/:token', validators.dates, validationErrorHandler, fileDownloadAuth, determineExcelFields, orderController.generate.excel);
router.get('/order/stats/pdf/:token', validators.dates, validationErrorHandler, fileDownloadAuth, determinePdfFields, orderController.generate.pdf);
router.get('/order/qrcode/:id', orderController.generate.qrcode);
router.get('/order/sticker/:id', orderController.generate.sticker);
router.get('/order/status/options', orderController.getStatusOptions);
router.get('/order/dataset', validators.dates, validationErrorHandler, orderController.dataset);

router.get('/query', validators.pagination, validationErrorHandler, universalPaginator);

router.post('/person/check/phone', validators.phone, validationErrorHandler, personController.checkPhoneUniqueness);
router.get('/person/info', checkAuth, personController.getInfo);
router.post('/person/login', validators.login, validationErrorHandler, personController.login);
router.delete('/person/:id', personController.delete);

router.get('/site/info', siteController.getSite);
router.put('/site/update', validators.site, validationErrorHandler, siteController.updateSite);

module.exports = router;