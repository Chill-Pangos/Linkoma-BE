const User = require("../models/user.model");
const Apartment = require("../models/apartment.model");
const userFieldConfig = require("../config/fieldConfig/user.fieldconfig");
const apiError = require("../utils/apiError");
const httpStatus = require("http-status");
const filterValidFields = require("../utils/filterValidFields");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const emailService = require("./email.service");

/**
 * @description Create a new user in the database
 *
 * @param {Object} userData - The user data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 */

const createUser = async (userData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      userData,
      userFieldConfig.insertableFields
    );

    const pwd = fields.password;

    if (fields.password) {
      const salt = await bcrypt.genSalt(10);
      fields.password = await bcrypt.hash(fields.password, salt);
    }

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    // If apartmentId is provided, validate apartment exists and update its status
    if (fields.apartmentId) {
      const apartment = await Apartment.findByPk(fields.apartmentId);
      if (!apartment) {
        throw new apiError(400, "Apartment not found");
      }
      
      // Update apartment status to rented
      await Apartment.update(
        { status: 'rented' },
        { where: { apartmentId: fields.apartmentId } }
      );
    }

    const user = await User.create(fields);

    if (!user) {
      throw new apiError(500, "User creation failed");
    }

    await emailService.sendAccountEmail(
      user.email,
      pwd
    );

    return { message: "User created successfully", userId: user.userId };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get a user by ID
 *
 * @param {number} userId - The ID of the user to be retrieved
 * @return {Object} - The user data
 * @throws {apiError} - If there is an error during the retrieval
 */

const getUserById = async (userId) => {
  try {
    if (!userId) {
      throw new apiError(400, "User ID is required");
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new apiError(404, "User not found");
    }

    return user;
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get all users with pagination and optional role filter
 *
 * @param {number} limit - The number of users to retrieve
 * @param {number} offset - The offset for pagination
 * @param {string} role - Optional role to filter by (admin, manager, resident)
 * @return {Array} - The list of users
 * @throws {apiError} - If there is an error during the retrieval
 */

const getUsers = async (limit, offset, role = null) => {
  try {
    // Build where clause for filtering
    const whereClause = {};
    
    if (role) {
      // Validate role
      const validRoles = ['admin', 'manager', 'resident'];
      if (!validRoles.includes(role)) {
        throw new apiError(400, `Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
      whereClause.role = role;
    }

    const users = await User.findAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [['userId', 'ASC']]
    });

    if (users.length === 0) {
      throw new apiError(404, role ? `No users found with role: ${role}` : "No users found");
    }

    const totalCount = await User.count({
      where: whereClause
    });

    return {
      data: users,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Math.ceil(offset / limit) + 1,
      totalCount: totalCount,
      ...(role && { filterBy: { role } })
    };
  } catch (error) {
    if (error instanceof apiError) {
      throw error;
    }
    throw new apiError(500, error.message);
  }
};

/**
 * @description Update a user by ID
 *
 * @param {number} userId - The ID of the user to be updated
 * @param {Object} userData  - The user data to be updated
 * @return {Object} - The result of the update
 * @throws {apiError} - If there is an error during the update
 */

const updateUser = async (userId, userData) => {
  try {
    if (!userId) {
      throw new apiError(400, "User ID is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      userData,
      userFieldConfig.updatableFields
    );

    if (fields.password) {
      const salt = await bcrypt.genSalt(10);
      fields.password = await bcrypt.hash(fields.password, salt);
    }

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    // Get current user data to check previous apartmentId
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      throw new apiError(404, "User not found");
    }

    // Handle apartment status updates if apartmentId changes
    if (fields.apartmentId !== undefined) {
      // If user had a previous apartment, set it back to available
      if (currentUser.apartmentId && currentUser.apartmentId !== fields.apartmentId) {
        await Apartment.update(
          { status: 'available' },
          { where: { apartmentId: currentUser.apartmentId } }
        );
      }

      // If user is assigned to a new apartment, set it to rented
      if (fields.apartmentId) {
        // Validate apartment exists
        const apartment = await Apartment.findByPk(fields.apartmentId);
        if (!apartment) {
          throw new apiError(400, "Apartment not found");
        }
        
        // Update apartment status to rented
        await Apartment.update(
          { status: 'rented' },
          { where: { apartmentId: fields.apartmentId } }
        );
      }
    }

    const [affectedRows] = await User.update(fields, {
      where: { userId: userId }
    });

    if (affectedRows === 0) {
      throw new apiError(500, "User update failed");
    }

    return { message: "User updated successfully", userId: userId };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Delete a user by ID
 *
 * @param {number} userId - The ID of the user to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 */

const deleteUser = async (userId) => {
  try {
    if (!userId) {
      throw new apiError(400, "User ID is required");
    }

    // Get user data before deletion to check apartmentId
    const user = await User.findByPk(userId);
    if (!user) {
      throw new apiError(404, "User not found");
    }

    // If user has an apartment, set it back to available
    if (user.apartmentId) {
      await Apartment.update(
        { status: 'available' },
        { where: { apartmentId: user.apartmentId } }
      );
    }

    const deletedRows = await User.destroy({
      where: { userId: userId }
    });

    if (deletedRows === 0) {
      throw new apiError(404, "User not found");
    }

    return { message: "User deleted successfully" };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get a user by email
 *
 * @param {string} email - The email of the user to be retrieved
 * @return {Object} - The user data
 * @throws {apiError} - If there is an error during the retrieval
 */

const getUserByEmail = async (email) => {
  try {
    if(!email) {
      throw new apiError(400, "Email is required");
    }

    const user = await User.findOne({
      where: { email: email }
    });

    if (!user) {
      throw new apiError(404, "User not found");
    }

    return user;
  } catch (error) {
    throw new apiError(500, error.message);
  }
}

/**
 * @description Create a user with a random password if the email does not exist
 *
 * @param {string} email - The email of the user to be created
 * @return {Object} - The result of the user creation
 * @throws {apiError} - If there is an error during the creation
 */

const createUserWithEmail = async (email) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email }
    });

    if (existingUser) {
      throw new apiError(
        409,
        "User with this email already exists"
      );
    }

    // Generate cryptographically secure password: 4 letters + 4 numbers
    const letterChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    
    const getRandomIndex = (arrayLength) => {
      const maxValid = Math.floor(256 / arrayLength) * arrayLength;
      let randomByte;
      do {
        randomByte = crypto.randomBytes(1)[0];
      } while (randomByte >= maxValid);
      return randomByte % arrayLength;
    };
    
    let letters = '';
    let numbers = '';
    
    for (let i = 0; i < 4; i++) {
      letters += letterChars[getRandomIndex(letterChars.length)];
    }
    
    for (let i = 0; i < 4; i++) {
      numbers += numberChars[getRandomIndex(numberChars.length)];
    }
    
    const password = letters + numbers;

    return await createUser({ email, password });
  } catch (error) {
    // If it's already an apiError, re-throw it
    if (error.isOperational) {
      throw error;
    }
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get users by specific role
 *
 * @param {string} role - The role to filter by (admin, manager, resident)
 * @param {number} limit - The number of users to retrieve (optional)
 * @param {number} offset - The offset for pagination (optional)
 * @return {Array} - The list of users with specified role
 * @throws {apiError} - If there is an error during the retrieval
 */

const getUsersByRole = async (role, limit = null, offset = null) => {
  try {
    const validRoles = ['admin', 'manager', 'resident'];
    if (!validRoles.includes(role)) {
      throw new apiError(400, `Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const queryOptions = {
      where: { role },
      order: [['userId', 'ASC']]
    };

    if (limit !== null) {
      queryOptions.limit = limit;
    }

    if (offset !== null) {
      queryOptions.offset = offset;
    }

    const users = await User.findAll(queryOptions);

    if (users.length === 0) {
      throw new apiError(404, `No users found with role: ${role}`);
    }

    const totalCount = await User.count({
      where: { role }
    });

    const result = {
      data: users,
      totalCount: totalCount,
      role: role
    };

    if (limit !== null) {
      result.totalPages = Math.ceil(totalCount / limit);
      result.currentPage = offset !== null ? Math.ceil(offset / limit) + 1 : 1;
    }

    return result;
  } catch (error) {
    if (error instanceof apiError) {
      throw error;
    }
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get count of users by role
 *
 * @return {Object} - Object containing count for each role
 * @throws {apiError} - If there is an error during the retrieval
 */

const getUserCountByRole = async () => {
  try {
    const [adminCount, managerCount, residentCount] = await Promise.all([
      User.count({ where: { role: 'admin' } }),
      User.count({ where: { role: 'manager' } }),
      User.count({ where: { role: 'resident' } })
    ]);

    return {
      admin: adminCount,
      manager: managerCount,
      resident: residentCount,
      total: adminCount + managerCount + residentCount
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  getUserByEmail,
  createUserWithEmail,
  getUsersByRole,
  getUserCountByRole
};
