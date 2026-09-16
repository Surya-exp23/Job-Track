import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },


    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    headline: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: [
      {
        company: {
          type: String,
          trim: true,
        },

        title: {
          type: String,
          trim: true,
        },

        startDate: {
          type: Date,
        },

        endDate: {
          type: Date,
        },

        description: {
          type: String,
          trim: true,
        },
      },
    ],

    education: [
      {
        institution: {
          type: String,
          trim: true,
        },

        degree: {
          type: String,
          trim: true,
        },

        field: {
          type: String,
          trim: true,
        },

        startDate: {
          type: Date,
        },

        endDate: {
          type: Date,
        },
      },
    ],

    projects: [
      {
        name: {
          type: String,
          trim: true,
        },

        description: {
          type: String,
          trim: true,
        },

        technologies: [
          {
            type: String,
            trim: true,
          },
        ],

        url: {
          type: String,
          trim: true,
        },
      },
    ],

    links: {
      github: {
        type: String,
        trim: true,
      },

      linkedin: {
        type: String,
        trim: true,
      },

      portfolio: {
        type: String,
        trim: true,
      },
    },

    designation: {
      type: String,
      trim: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model("Profile", profileSchema);