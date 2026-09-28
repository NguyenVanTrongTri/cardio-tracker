const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { symlinkSync } = require('fs');

const getCateLog = async (req, res);
const createCateLog = async (req, res);
const updateCateLog = async (req, res);
const deleteCateLog = async (req, res);

module.exports = {getCateLog, createCateLog, updateCateLog, deleteCateLog};