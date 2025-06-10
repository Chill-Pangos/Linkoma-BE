const httpStatus = require('http-status');
const pick = require('../utils/pick');
const apiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const { invoiceService } = require('../services');

const createInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(201).send(invoice);
});

const createInvoiceWithDetails = catchAsync(async (req, res) => {
  const invoice = await invoiceService.createInvoiceWithDetails(req.body);
  res.status(201).send(invoice);
});

const getInvoices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['apartmentId', 'status', 'minRentFee', 'maxRentFee', 'minServiceFee', 'maxServiceFee', 'dueDate']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await invoiceService.queryInvoices(filter, options);
  res.send(result);
});

const getInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.invoiceId);
  if (!invoice) {
    throw new apiError(404, 'Invoice not found');
  }
  res.send(invoice);
});

const updateInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.updateInvoice(req.params.invoiceId, req.body);
  res.send(invoice);
});

const deleteInvoice = catchAsync(async (req, res) => {
  await invoiceService.deleteInvoice(req.params.invoiceId);
  res.status(204).send();
});

module.exports = {
  createInvoice,
  createInvoiceWithDetails,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
};
