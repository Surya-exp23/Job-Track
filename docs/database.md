## Jobradar- Database design

- initial collections

1. User
2. Profile
3. Resume
4. Company
5. Job
6. Application
7. SavedJob
8. Resumeanalysis
9. Subscription
10. Payment


## User model

inital model is like:
    _id
    email - must be req, unique
    passwordhash
    role- recuiter or candidate
    authProvider - local or google or any other way 
    isEmailVerified - yes or no
    isActive - This let deactivate an account without deleting all its data
    createdAt
    updatedAt


## Profile model

    first name
    lastname
    phone
    location
    headline
    bio
    skills
    experience
    education
    links

> little bit thing to notice is we have two roles user and recruiter

- Candidate
    Skills
    Experience
    Education
    Projects

-recuiter
    Company 
    designation
    contact information

## Resume model
- original file
    originalfilename
    fileurl
    filetype
    filesize

-processing
    processingstates
    extractedtext

-parsed information
    parseddata

userid
createdat
updatedat

## company model

name
description
website
logo
industry
size
location
createdby
isverified
timestamp

## Job model

    title
    description
    company
    location
    remotetype
    employementtype
    experiencelevel
    salary
    skils
    source==>source: {
        type: "EXTERNAL",
        provider: "some-job-provider",
        externalId: "12345",
        url: "..."
    } - When we finds jobs from some jobs

    and for recruiters we just add only type: "recuiter"

    postedat
    expiresat
    status


## Application model
(will look into for more advance flow for later)

    userid
    jobid
    status
    appliedsat

    - may add or can use these features
        resumeid
        notes
        timeline


## saved Jobs

    userId
    jobid
    createdAt

## Resume analysis (Will check for this whether can be changed or not)

    userId
    resumeId
    overallScore

    scores
    strengths
    weaknesses
    suggestions

    model
    createdAt

 ## subscription model

    free/premium
    active/cancelled/expired

    userid
    plan
    status
    provider
    providercustomerId
    providesubscriptionsid
    startdate
    enddate
- will look into it later


## paymet schema

    userId
    subscriptionId
    provider
    providerOrderId
    providerPaymentId
    amount
    currency
    status
    metadata
    createdAt


## relationships


    User 1 ─── 1 Profile

    User 1 ─── N Resume

    User 1 ─── N Application
    Job 1 ─── N Application

    User 1 ─── N SavedJob
    Job 1 ─── N SavedJob

    User 1 ─── N ResumeAnalysis
    Resume 1 ─── N ResumeAnalysis
    Job 1 ─── N ResumeAnalysis

    User 1 ─── 1 Subscription

    Subscription 1 ─── N Payment

    User 1 ─── N Company
    Company 1 ─── N Job

    User 1 ─── N Job



