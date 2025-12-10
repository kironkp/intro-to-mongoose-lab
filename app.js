const prompt = require('prompt-sync')();

// const username = prompt('What is your name? ');

// console.log(`Your name is ${username}`);


require('dotenv').config();
const mongoose = require('mongoose');
// const prompt = require('prompt-sync')({ sigint: true }); // sigint lets Ctrl+C exit nicely
const Customer = require('./models/Customer');

// 1. Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

// 2. CRUD functions

async function createCustomer() {
  console.log('\nCreating a customer:\n');

  const name = prompt('What is the customer’s name? ');
  const ageInput = prompt('What is the customer’s age? ');
  const age = Number(ageInput);

  if (!name.trim()) {
    console.log('Name cannot be empty.');
    return;
  }

  if (Number.isNaN(age)) {
    console.log('Age must be a number.');
    return;
  }

  const customer = new Customer({ name, age });
  await customer.save();

  console.log('\n✅ Customer created:');
  console.log(`id: ${customer._id} -- Name: ${customer.name}, Age: ${customer.age}`);
}

async function viewCustomers() {
  const customers = await Customer.find();

  console.log('\nBelow is a list of customers:\n');

  if (customers.length === 0) {
    console.log('No customers found.');
    return;
  }

  customers.forEach((c) => {
    console.log(`id: ${c._id} --  Name: ${c.name}, Age: ${c.age}`);
  });
}

async function updateCustomer() {
  console.log('\nUpdating a customer:\n');

  // First, show all customers
  await viewCustomers();

  const id = prompt('\nCopy and paste the id of the customer you would like to update here: ');

  const existing = await Customer.findById(id);
  if (!existing) {
    console.log('❌ No customer found with that id.');
    return;
  }

  const newName = prompt("What is the customer's new name? ");
  const newAgeInput = prompt("What is the customer's new age? ");
  const newAge = Number(newAgeInput);

  if (!newName.trim()) {
    console.log('Name cannot be empty.');
    return;
  }

  if (Number.isNaN(newAge)) {
    console.log('Age must be a number.');
    return;
  }

  existing.name = newName;
  existing.age = newAge;
  await existing.save();

  console.log('\n✅ Customer updated:');
  console.log(`id: ${existing._id} --  Name: ${existing.name}, Age: ${existing.age}`);
}

async function deleteCustomer() {
  console.log('\nDeleting a customer:\n');

  // First, show all customers
  await viewCustomers();

  const id = prompt('\nCopy and paste the id of the customer you would like to delete here: ');

  const deleted = await Customer.findByIdAndDelete(id);

  if (!deleted) {
    console.log('❌ No customer found with that id.');
    return;
  }

  console.log('\n✅ Customer deleted:');
  console.log(`id: ${deleted._id} --  Name: ${deleted.name}, Age: ${deleted.age}`);
}

// 3. Menu loop

function printMenu() {
  console.log('\nWhat would you like to do?\n');
  console.log('  1. Create a customer');
  console.log('  2. View all customers');
  console.log('  3. Update a customer');
  console.log('  4. Delete a customer');
  console.log('  5. Quit\n');
}

async function main() {
  console.log('Welcome to the CRM');

  await connectDB();

  let running = true;

  while (running) {
    printMenu();
    const choice = prompt('Number of action to run: ');

    switch (choice) {
      case '1':
        await createCustomer();
        break;
      case '2':
        await viewCustomers();
        break;
      case '3':
        await updateCustomer();
        break;
      case '4':
        await deleteCustomer();
        break;
      case '5':
        console.log('\nexiting...');
        running = false;
        break;
      default:
        console.log('Please choose a number between 1 and 5.');
    }
  }

  // Close MongoDB connection before exiting
  await mongoose.connection.close();
  console.log('MongoDB connection closed. Goodbye!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  mongoose.connection.close().then(() => process.exit(1));
});