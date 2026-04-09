import React, { useState, useEffect } from "react";
import BackButton from '../BackButton';

function Settings() {
  // Load saved theme
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Apply dark class + save
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    if (dark) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="flex items-center justify-center w-full h-full bg-linear-to-br from-purple-100 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4 transition-all duration-500 overflow-hidden">

      <div className="w-full max-w-4xl">
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <BackButton fallbackRoute="/db" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2 ml-15">
            Manage your preferences and profile settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Profile
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full Name"
                className="border p-3 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none dark:bg-gray-800 dark:text-white"
              />

              <input
                type="email"
                placeholder="Email Address"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none dark:bg-gray-800 dark:text-white"
            />

            <button className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold">
              Save Profile
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Preferences
          </h2>

          <div className="flex flex-col gap-4">

            {/* Dark Mode Toggle */}
            <div className="flex justify-between items-center">
              <span className="dark:text-white font-medium">
                Dark Mode
              </span>

              <button
                onClick={() => setDark(!dark)}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${
                  dark ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                    dark ? "translate-x-7" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="dark:text-white">AI Suggestions</span>
              <input type="checkbox" defaultChecked />
            </div>

            <div className="flex justify-between items-center">
              <span className="dark:text-white">Email Notifications</span>
              <input type="checkbox" />
            </div>

          </div>
        </div>

        {/* Account */}
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Account
          </h2>

          <div className="flex justify-between items-center">

            <div>
              <p className="text-gray-700 dark:text-gray-200">
                Delete your account permanently
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone.
              </p>
            </div>

            <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
              Delete Account
            </button>

          </div>
        </div>

        </div>
      </div>
    </div>
  );
}

export default Settings;