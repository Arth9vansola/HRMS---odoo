const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');
const Department = require('./models/Department');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await Employee.deleteMany({});
    await Department.deleteMany({});
    console.log('Cleared existing data');

    // Create departments
    const departments = await Department.create([
      {
        name: 'Information Technology',
        description: 'Technology and software development',
        status: 'Active',
        employeeCount: 0,
      },
      {
        name: 'Human Resources',
        description: 'HR operations and employee management',
        status: 'Active',
        employeeCount: 0,
      },
      {
        name: 'Finance',
        description: 'Financial operations and accounting',
        status: 'Active',
        employeeCount: 0,
      },
      {
        name: 'Marketing',
        description: 'Marketing and brand management',
        status: 'Active',
        employeeCount: 0,
      },
    ]);

    console.log('Created departments');

    // Create employees
    const employees = await Employee.create([
      {
        employeeId: 'EMP001',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@workzen.com',
        password: 'admin123',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'Male',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        department: departments[0]._id,
        designation: 'System Administrator',
        role: 'admin',
        joiningDate: new Date('2020-01-01'),
        employmentType: 'Full-Time',
        salary: 100000,
        bankDetails: {
          accountNumber: '1234567890',
          bankName: 'Bank of America',
          ifscCode: 'BOA123',
        },
        status: 'Active',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '+1234567891',
        },
      },
      {
        employeeId: 'EMP002',
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@workzen.com',
        password: 'hr123',
        phone: '+1234567892',
        dateOfBirth: new Date('1988-05-15'),
        gender: 'Female',
        address: {
          street: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          country: 'USA',
        },
        department: departments[1]._id,
        designation: 'HR Manager',
        role: 'hr',
        joiningDate: new Date('2020-03-01'),
        employmentType: 'Full-Time',
        salary: 80000,
        status: 'Active',
      },
      {
        employeeId: 'EMP003',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@workzen.com',
        password: 'employee123',
        phone: '+1234567893',
        dateOfBirth: new Date('1995-08-20'),
        gender: 'Male',
        address: {
          street: '789 Pine St',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          country: 'USA',
        },
        department: departments[0]._id,
        designation: 'Software Developer',
        role: 'employee',
        joiningDate: new Date('2021-06-01'),
        employmentType: 'Full-Time',
        salary: 75000,
        status: 'Active',
      },
      {
        employeeId: 'EMP004',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@workzen.com',
        password: 'employee123',
        phone: '+1234567894',
        dateOfBirth: new Date('1992-03-10'),
        gender: 'Female',
        address: {
          street: '321 Elm St',
          city: 'New York',
          state: 'NY',
          zipCode: '10004',
          country: 'USA',
        },
        department: departments[3]._id,
        designation: 'Marketing Executive',
        role: 'employee',
        joiningDate: new Date('2021-09-01'),
        employmentType: 'Full-Time',
        salary: 70000,
        status: 'Active',
      },
      {
        employeeId: 'EMP005',
        firstName: 'Manager',
        lastName: 'Team',
        email: 'manager@workzen.com',
        password: 'manager123',
        phone: '+1234567895',
        dateOfBirth: new Date('1985-11-25'),
        gender: 'Male',
        address: {
          street: '555 Maple Dr',
          city: 'New York',
          state: 'NY',
          zipCode: '10005',
          country: 'USA',
        },
        department: departments[0]._id,
        designation: 'IT Manager',
        role: 'manager',
        joiningDate: new Date('2019-01-01'),
        employmentType: 'Full-Time',
        salary: 90000,
        status: 'Active',
      },
      {
        employeeId: 'EMP006',
        firstName: 'Payroll',
        lastName: 'Officer',
        email: 'payroll@workzen.com',
        password: 'payroll123',
        phone: '+1234567896',
        dateOfBirth: new Date('1993-07-12'),
        gender: 'Female',
        address: {
          street: '777 Finance St',
          city: 'New York',
          state: 'NY',
          zipCode: '10006',
          country: 'USA',
        },
        department: departments[2]._id,
        designation: 'Payroll Specialist',
        role: 'payroll',
        joiningDate: new Date('2021-02-01'),
        employmentType: 'Full-Time',
        salary: 65000,
        status: 'Active',
      },
      {
        employeeId: 'EMP007',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@workzen.com',
        password: 'employee123',
        phone: '+1234567897',
        dateOfBirth: new Date('1994-04-18'),
        gender: 'Female',
        address: {
          street: '888 Cedar Ln',
          city: 'New York',
          state: 'NY',
          zipCode: '10007',
          country: 'USA',
        },
        department: departments[0]._id,
        designation: 'Frontend Developer',
        role: 'employee',
        joiningDate: new Date('2022-01-15'),
        employmentType: 'Full-Time',
        salary: 72000,
        status: 'Active',
      },
      {
        employeeId: 'EMP008',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@workzen.com',
        password: 'employee123',
        phone: '+1234567898',
        dateOfBirth: new Date('1991-09-22'),
        gender: 'Male',
        address: {
          street: '999 Birch Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10008',
          country: 'USA',
        },
        department: departments[0]._id,
        designation: 'Backend Developer',
        role: 'employee',
        joiningDate: new Date('2021-08-10'),
        employmentType: 'Full-Time',
        salary: 78000,
        status: 'Active',
      },
      {
        employeeId: 'EMP009',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@workzen.com',
        password: 'employee123',
        phone: '+1234567899',
        dateOfBirth: new Date('1996-12-05'),
        gender: 'Female',
        address: {
          street: '111 Willow St',
          city: 'New York',
          state: 'NY',
          zipCode: '10009',
          country: 'USA',
        },
        department: departments[3]._id,
        designation: 'Social Media Manager',
        role: 'employee',
        joiningDate: new Date('2022-03-20'),
        employmentType: 'Full-Time',
        salary: 68000,
        status: 'Active',
      },
      {
        employeeId: 'EMP010',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@workzen.com',
        password: 'employee123',
        phone: '+1234567900',
        dateOfBirth: new Date('1989-06-30'),
        gender: 'Male',
        address: {
          street: '222 Ash Dr',
          city: 'New York',
          state: 'NY',
          zipCode: '10010',
          country: 'USA',
        },
        department: departments[2]._id,
        designation: 'Financial Analyst',
        role: 'employee',
        joiningDate: new Date('2020-11-01'),
        employmentType: 'Full-Time',
        salary: 76000,
        status: 'Active',
      },
      {
        employeeId: 'EMP011',
        firstName: 'Lisa',
        lastName: 'Martinez',
        email: 'lisa.martinez@workzen.com',
        password: 'employee123',
        phone: '+1234567901',
        dateOfBirth: new Date('1993-02-14'),
        gender: 'Female',
        address: {
          street: '333 Spruce Ln',
          city: 'New York',
          state: 'NY',
          zipCode: '10011',
          country: 'USA',
        },
        department: departments[1]._id,
        designation: 'HR Coordinator',
        role: 'employee',
        joiningDate: new Date('2021-07-01'),
        employmentType: 'Full-Time',
        salary: 62000,
        status: 'Active',
      },
      {
        employeeId: 'EMP012',
        firstName: 'Robert',
        lastName: 'Taylor',
        email: 'robert.taylor@workzen.com',
        password: 'employee123',
        phone: '+1234567902',
        dateOfBirth: new Date('1987-10-08'),
        gender: 'Male',
        address: {
          street: '444 Poplar Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10012',
          country: 'USA',
        },
        department: departments[0]._id,
        designation: 'DevOps Engineer',
        role: 'employee',
        joiningDate: new Date('2020-05-15'),
        employmentType: 'Full-Time',
        salary: 82000,
        status: 'Active',
      },
      {
        employeeId: 'EMP013',
        firstName: 'Amanda',
        lastName: 'Anderson',
        email: 'amanda.anderson@workzen.com',
        password: 'employee123',
        phone: '+1234567903',
        dateOfBirth: new Date('1995-03-27'),
        gender: 'Female',
        address: {
          street: '555 Cherry St',
          city: 'New York',
          state: 'NY',
          zipCode: '10013',
          country: 'USA',
        },
        department: departments[3]._id,
        designation: 'Content Writer',
        role: 'employee',
        joiningDate: new Date('2022-02-10'),
        employmentType: 'Full-Time',
        salary: 60000,
        status: 'Active',
      },
      {
        employeeId: 'EMP014',
        firstName: 'James',
        lastName: 'Thomas',
        email: 'james.thomas@workzen.com',
        password: 'employee123',
        phone: '+1234567904',
        dateOfBirth: new Date('1990-08-19'),
        gender: 'Male',
        address: {
          street: '666 Walnut Rd',
          city: 'New York',
          state: 'NY',
          zipCode: '10014',
          country: 'USA',
        },
        department: departments[0]._id,
        designation: 'QA Engineer',
        role: 'employee',
        joiningDate: new Date('2021-10-05'),
        employmentType: 'Full-Time',
        salary: 70000,
        status: 'Active',
      },
      {
        employeeId: 'EMP015',
        firstName: 'Jessica',
        lastName: 'White',
        email: 'jessica.white@workzen.com',
        password: 'employee123',
        phone: '+1234567905',
        dateOfBirth: new Date('1992-11-11'),
        gender: 'Female',
        address: {
          street: '777 Hickory Ln',
          city: 'New York',
          state: 'NY',
          zipCode: '10015',
          country: 'USA',
        },
        department: departments[2]._id,
        designation: 'Accountant',
        role: 'employee',
        joiningDate: new Date('2020-09-20'),
        employmentType: 'Full-Time',
        salary: 71000,
        status: 'Active',
      },
    ]);

    console.log('Created employees');

    // Update department employee counts
    for (const dept of departments) {
      const count = await Employee.countDocuments({ department: dept._id });
      dept.employeeCount = count;
      await dept.save();
    }

    // Set department managers
    departments[0].manager = employees[4]._id; // IT Manager
    departments[1].manager = employees[1]._id; // HR Manager
    await departments[0].save();
    await departments[1].save();

    console.log('Updated department managers');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@workzen.com');
    console.log('  Password: admin123');
    console.log('\nHR Manager:');
    console.log('  Email: hr@workzen.com');
    console.log('  Password: hr123');
    console.log('\nTeam Manager:');
    console.log('  Email: manager@workzen.com');
    console.log('  Password: manager123');
    console.log('\nPayroll Officer:');
    console.log('  Email: payroll@workzen.com');
    console.log('  Password: payroll123');
    console.log('\nEmployee:');
    console.log('  Email: john.doe@workzen.com');
    console.log('  Password: employee123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
