const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');
const SalaryComponent = require('./models/SalaryComponent');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

async function seedSalaryComponents() {
  await connectDB();
  
  try {
    const employees = await Employee.find({ status: 'Active' });
    console.log(`Found ${employees.length} active employees`);
    
    let created = 0;
    let skipped = 0;
    
    for (const employee of employees) {
      // Check if salary component already exists
      const existing = await SalaryComponent.findOne({ employee: employee._id });
      if (existing) {
        console.log(`Skipped: ${employee.firstName} ${employee.lastName} - already has salary component`);
        skipped++;
        continue;
      }
      
      // Assign basic salary based on designation (example logic)
      let basicSalary = 50000;
      if (employee.designation?.toLowerCase().includes('manager')) {
        basicSalary = 80000;
      } else if (employee.designation?.toLowerCase().includes('senior')) {
        basicSalary = 60000;
      } else if (employee.designation?.toLowerCase().includes('junior')) {
        basicSalary = 35000;
      }
      
      const salaryComponent = new SalaryComponent({
        employee: employee._id,
        effectiveDate: new Date(),
        basicSalary: basicSalary,
        totalWage: Math.round(basicSalary * 1.8), // Total wage ~1.8x basic
        // HRA: 40% of basic
        hra: {
          isPercentage: true,
          percentage: 40,
          amount: 0, // Will be calculated by pre-save hook
        },
        // Standard Allowance: 10% of basic
        standardAllowance: {
          isPercentage: true,
          percentage: 10,
          amount: 0,
        },
        // Performance Bonus: 8% of basic
        performanceBonus: {
          isPercentage: true,
          percentage: 8,
          amount: 0,
        },
        // LTA: Fixed amount
        lta: {
          isPercentage: false,
          amount: 5000,
        },
        // Fixed Allowance: 5% of basic
        fixedAllowance: {
          isPercentage: true,
          percentage: 5,
          amount: 0,
        },
        // Employee PF: 12% of basic
        employeePF: {
          isPercentage: true,
          percentage: 12,
          amount: 0,
        },
        // Employer PF: 12% of basic
        employerPF: {
          isPercentage: true,
          percentage: 12,
          amount: 0,
        },
        // Professional Tax: Fixed ₹200
        professionalTax: {
          isPercentage: false,
          amount: 200,
        },
      });
      
      await salaryComponent.save();
      console.log(`✓ Created salary component for ${employee.firstName} ${employee.lastName} - Basic: ₹${basicSalary}`);
      created++;
    }
    
    console.log('\n=== Summary ===');
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${employees.length}`);
    console.log('\nSalary components seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding salary components:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedSalaryComponents();
