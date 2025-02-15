import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  // 🔹 FETCH BUDGETS (Runs on load)
  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }
  
      const response = await fetch("https://homebudgetapp-1.onrender.com/budgets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  // 🔹 Include token
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch budgets.");
      }
  
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message);
    }
  };
  

  // 🔹 FETCH SINGLE BUDGET BY ID
  const fetchBudgetById = async (budget_id) => {
    try {
      const response = await fetch(`https://homebudgetapp-1.onrender.com/budget/${budget_id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch budget.");
      }

      return await response.json();
    } catch (error) {
      console.error("Fetch single budget error:", error);
      toast.error("Error fetching budget.");
      return null;
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading("Uploading image...");

    try {
      const response = await fetch("https://homebudgetapp-1.onrender.com/budgets/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setImageUrl(data.image_url);
        toast.update(toastId, {
          render: "Image uploaded successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        throw new Error(data.error || "Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.update(toastId, {
        render: error.message || "Image upload failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  // 🔹 ADD NEW BUDGET
  const addBudget = async (budgetData) => {
    toast.loading("Adding budget...");

    try {
      const response = await fetch("https://homebudgetapp-1.onrender.com/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        throw new Error("Failed to add budget.");
      }

      const newBudget = await response.json();
      setBudgets((prevBudgets) => [...prevBudgets, newBudget]);

      toast.dismiss();
      toast.success("Budget added successfully!");
    } catch (error) {
      toast.dismiss();
      console.error("Add budget error:", error);
      toast.error("Error adding budget.");
    }
  };

  // 🔹 UPDATE BUDGET
  const updateBudget = async (budget_id, updatedData) => {
    toast.loading("Updating budget...");

    try {
      const response = await fetch(`https://homebudgetapp-1.onrender.combudgets/${budget_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update budget.");
      }

      const updatedBudget = await response.json();
      setBudgets((prevBudgets) =>
        prevBudgets.map((budget) =>
          budget.id === budget_id ? updatedBudget : budget
        )
      );

      toast.dismiss();
      toast.success("Budget updated successfully!");
    } catch (error) {
      toast.dismiss();
      console.error("Update error:", error);
      toast.error("Error updating budget.");
    }
  };

  // 🔹 DELETE BUDGET
  const deleteBudget = async (budget_id) => {
    toast.loading("Deleting budget...");

    try {
      const response = await fetch(`https://homebudgetapp-1.onrender.com/budgets/${budget_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete budget.");
      }

      setBudgets((prevBudgets) => prevBudgets.filter((budget) => budget.id !== budget_id));

      toast.dismiss();
      toast.success("Budget deleted successfully!");
    } catch (error) {
      toast.dismiss();
      console.error("Delete error:", error);
      toast.error("Error deleting budget.");
    }
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        fetchBudgets,
        fetchBudgetById,
        addBudget,
        updateBudget,
        deleteBudget,
        handleFileUpload,
        imageUrl,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
