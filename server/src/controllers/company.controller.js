import mongoose from 'mongoose';
import Company from '../models/company.model.js';
import { NotFoundError } from '../utils/errors.js';
import Job from '../models/job.model.js';

const COMPANY_SIZES=[
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1001-5000",
    "5001-10000",
    "10001+"
];

const UPDATABLE_FIELDS = [
    'name',
    'description',
    'website',
    'logoUrl',
    'industry',
    'size',
    'location'
];


const escapeRegExp=(value)=>value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createCompany = async (req, res, next) => {
    try{
        const {name, description, website, logoUrl, industry, size, location} = req.body;
        if(!name || !name.trim()){
            return res.status(400).json({
                success: false,
                message: 'Company name is required',
            });
        };
        if(size && !COMPANY_SIZES.includes(size)){
            return res.status(400).json({
                success: false,
                message: `size must be one of the following: ${COMPANY_SIZES.join(', ')}`,
            });
        }
        
    }catch(err){
        
    }
}   