const httpStatus = require('http-status');
const pick = require('../utils/pick');
const apiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const { invoiceDetailService } = require('../services');

const createInvoiceDetail = catchAsync(async (req, res) => {
  const invoiceDetail = await invoiceDetailService.createInvoiceDetail(req.body);
  res.status(201).send(invoiceDetail);
});

const getInvoiceDetails = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['invoiceId', 'serviceTypeId', 'minUsage', 'maxUsage', 'minTotalAmount', 'maxTotalAmount']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await invoiceDetailService.queryInvoiceDetails(filter, options);
  res.send(result);
});

const getInvoiceDetail = catchAsync(async (req, res) => {
  const invoiceDetail = await invoiceDetailService.getInvoiceDetailById(req.params.invoiceDetailId);
  if (!invoiceDetail) {
    throw new apiError(404, 'Invoice detail not found');
  }
  res.send(invoiceDetail);
});

const updateInvoiceDetail = catchAsync(async (req, res) => {
  const invoiceDetail = await invoiceDetailService.updateInvoiceDetail(req.params.invoiceDetailId, req.body);
  res.send(invoiceDetail);
});

const deleteInvoiceDetail = catchAsync(async (req, res) => {
  await invoiceDetailService.deleteInvoiceDetail(req.params.invoiceDetailId);
  res.status(204).send();
});

module.exports = {
  createInvoiceDetail,
  getInvoiceDetails,
  getInvoiceDetail,
  updateInvoiceDetail,
  deleteInvoiceDetail,
};
