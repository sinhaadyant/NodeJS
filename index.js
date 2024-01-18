const express = require("express");
const fs = require("fs").promises;
const app = express();
const PORT = 8000;
const dataFilePath = "contacts.json";

app.use(express.json());

// Common function to fetch data from file
async function fetchData() {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Common function to store data to file
async function storeData(data) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error storing data:", error);
  }
}

app.get("/contacts", async (req, res) => {
  try {
    const data = await fetchData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/contacts/searchByName/:keyword", async (req, res) => {
  const keyword = req.params.keyword.toLowerCase();

  try {
    const data = await fetchData();

    const filteredContacts = data.filter((contact) => {
      const firstName = contact.firstName.toLowerCase();
      const lastName = contact.lastName.toLowerCase();

      return firstName.includes(keyword) || lastName.includes(keyword);
    });

    res.json({ success: true, data: filteredContacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/contacts/searchByMobile/:mobile", async (req, res) => {
  const mobile = req.params.mobile;

  try {
    const data = await fetchData();

    const contact = data.find((e) => e.mobile == mobile);
    if (!contact) {
      res.json({
        success: false,
        message: `Contact not found with mobile ${mobile}`,
      });
    } else {
      res.json({
        success: true,
        data: contact,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/contact/add", async (req, res) => {
  const { firstName, lastName, mobile } = req.body;

  try {
    const data = await fetchData();

    const contact = data.find((e) => e.mobile == mobile);
    if (!contact) {
      data.push({ firstName, lastName, mobile });
      await storeData(data);
      res.json({ success: true, message: "Contact Added" });
    } else {
      res.json({
        success: false,
        message: `Contact with ${mobile} Already Exists`,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.delete("/contact", async (req, res) => {
  const { mobile } = req.body;

  try {
    let data = await fetchData();
    const indexToDelete = data.findIndex((item) => item.mobile === mobile);

    if (indexToDelete !== -1) {
      data.splice(indexToDelete, 1);
      await storeData(data);
      res.json({
        success: true,
        message: "Contact deleted successfully",
      });
    } else {
      res.json({
        success: false,
        message: "Contact not found with this mobile number",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Express Server Started on Port ${PORT}`);
});
