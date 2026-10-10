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
        const existing = await Company.findOne({name: new RegExp(`^${escapeRegExp(name)}$`, 'i')});
        if(existing){
            return res.status(400).json({
                success: false,
                message: 'Company with this name already exists',
            });
        }

        const company = await Company.create({
            name: name.trim(),
            description: description?.trim(),
            website: website?.trim(),
            logoUrl: logoUrl?.trim(),
            industry: industry?.trim(),
            size,
            location: location?.trim(),
            createdBy: req.user._id,
        })
        return res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: {company},
        });
        
    }catch(error){
        next(error);
    }
};   


const getCompanies = async (req, res, next) => {
    try{
        const page = Math.max(1, parseInt(req.query.page)) || 1;
        const limit = Math.min(50,Math.max(1, parseInt(req.query.limit))) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        if(req.query.q?.trim()){
            filter.name={$regex: escapeRegExp(req.query.q.trim()), $options: 'i'};
        }

        const [companies, total] = await Promise.all([
           Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Company.countDocuments(filter),
        ]);
        return res.status(200).json({
            success: true,
            message: 'Companies retrieved successfully',
            data: {
                companies,
                pagination:{
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    }catch(error){
        next(error);
    }
}

const getCompany = async (req, res, next) => {
    try{
        const {id} = req.params;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                success: false,
                message: "Company not found",
            });
        }

        const company = await Company.findById(id);
        if(!company){{
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }}

        return res.status(200).json({
            success: true,
            message: 'Company retrieved successfully',
            data: {company},
        });

    }catch(error){
        next(error);
    }
};



const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }


    // will work on this functionality, later
    if (company.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update companies you created",
      });
    }

    const updates = {};
    for (const field of UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if ("name" in updates && !updates.name) {
      return res.status(400).json({
        success: false,
        message: "Company name cannot be empty",
      });
    }

    if (updates.size && !COMPANY_SIZES.includes(updates.size)) {
      return res.status(400).json({
        success: false,
        message: `size must be one of: ${COMPANY_SIZES.join(", ")}`,
      });
    }

    if (updates.name) {
      const duplicate = await Company.findOne({
        _id: { $ne: company._id },
        name: { $regex: `^${escapeRegExp(updates.name)}$`, $options: "i" },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A company with this name already exists",
        });
      }
    }

    Object.assign(company, updates);
    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: { company },
    });
  } catch (error) {
    next(error);
  }
};


const deleteCompany = async (req, res, next) => {
    try{
        const {id} = req.params;

        if(!mongoose.isValidObjectId(id)){
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const company = await Company.findById(id);
        if(!company){
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        if(company.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only delete companies you created",
            });
        }

        const jobCount = await Job.countDocuments({ company: company._id });

        if(jobCount > 0){
            return res.status(400).json({
                success: false,
                message: "Cannot delete company with associated jobs",
            });
        }

        await company.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Company deleted successfully",
        });

    } catch (error) {
        next(error);
    }
}

export {createCompany, getCompanies, getCompany, updateCompany, deleteCompany};