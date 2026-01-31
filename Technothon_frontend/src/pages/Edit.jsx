/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 👈 needed for navigation

const Card = ({ children, className = "" }) => (
  <div
    className={`backdrop-blur-lg bg-purple-500/10 border border-white/10 rounded-2xl p-6 shadow-md text-white ${className}`}
  >
    {children}
  </div>
);

const Input = ({ type = "text", ...props }) => (
  <input
    type={type}
    {...props}
    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-400 outline-none transition-colors text-white"
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-400 outline-none transition-colors text-white"
  />
);

const Edit = () => {
  const navigate = useNavigate(); // 👈 react-router hook

  const [achievements, setAchievements] = useState([{ title: "", description: "", image: null }]);
  const [certificates, setCertificates] = useState([{ title: "", description: "", image: null }]);

  const handleChange = (list, setList, index, field, value) => {
    const updatedList = [...list];
    updatedList[index][field] = value;
    setList(updatedList);
  };

  const addField = (setList, item) => {
    setList((prev) => [...prev, item]);
  };

  const removeField = (list, setList, index) => {
    const updatedList = [...list];
    updatedList.splice(index, 1);
    setList(updatedList);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/bg2.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 "></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Go Back Button */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => navigate("/user")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            ←
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 text-white">Achievements</h2>
            {achievements.map((achievement, index) => (
              <div key={index} className="mb-4 space-y-2">
                <Input
                  placeholder="Title"
                  value={achievement.title}
                  onChange={(e) =>
                    handleChange(achievements, setAchievements, index, "title", e.target.value)
                  }
                />
                <Textarea
                  placeholder="Description"
                  value={achievement.description}
                  onChange={(e) =>
                    handleChange(achievements, setAchievements, index, "description", e.target.value)
                  }
                />
                <Input
                  type="file"
                  onChange={(e) =>
                    handleChange(achievements, setAchievements, index, "image", e.target.files[0])
                  }
                />
                <button
                  onClick={() => removeField(achievements, setAchievements, index)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-2 hover:bg-red-700 transition"
                >
                  <FaTrash />
                  <span>Remove</span>
                </button>
              </div>
            ))}
            <button
              onClick={() => addField(setAchievements, { title: "", description: "", image: null })}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add Achievement
            </button>
          </Card>

          {/* Certificates */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 text-white">Certificates</h2>
            {certificates.map((certificate, index) => (
              <div key={index} className="mb-4 space-y-2">
                <Input
                  placeholder="Title"
                  value={certificate.title}
                  onChange={(e) =>
                    handleChange(certificates, setCertificates, index, "title", e.target.value)
                  }
                />
                <Textarea
                  placeholder="Description"
                  value={certificate.description}
                  onChange={(e) =>
                    handleChange(certificates, setCertificates, index, "description", e.target.value)
                  }
                />
                <Input
                  type="file"
                  onChange={(e) =>
                    handleChange(certificates, setCertificates, index, "image", e.target.files[0])
                  }
                />
                <button
                  onClick={() => removeField(certificates, setCertificates, index)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-2 hover:bg-red-700 transition"
                >
                  <FaTrash />
                  <span>Remove</span>
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                addField(setCertificates, { title: "", description: "", image: null })
              }
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add Certificate
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Edit;
