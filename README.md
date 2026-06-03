# Loan Approval Prediction

A React application for credit application scoring based on the Kaggle [Playground Series S4E10](https://www.kaggle.com/competitions/playground-series-s4e10) loan approval dataset. The app presents a borrower profile form, produces an approval probability, and can connect to a backend prediction endpoint.

## Overview

The project connects a tabular machine learning workflow with a product-style scoring interface. It is designed as a practical credit risk workspace rather than a landing page.

## Dataset

The training dataset contains 58,645 rows and the test dataset contains 39,098 rows.

Target column:

- `loan_status = 1` for the positive class
- `loan_status = 0` for the negative class

Positive class share in the training data: 14.24%.

## Features

| Field | Description |
| --- | --- |
| `person_age` | Borrower age |
| `person_income` | Annual income |
| `person_home_ownership` | Home ownership category |
| `person_emp_length` | Employment length in years |
| `loan_intent` | Loan purpose |
| `loan_grade` | Loan grade from `A` to `G` |
| `loan_amnt` | Loan amount |
| `loan_int_rate` | Interest rate |
| `loan_percent_income` | Loan amount as a share of income |
| `cb_person_default_on_file` | Prior default flag |
| `cb_person_cred_hist_length` | Credit history length |

## Model Workflow

The notebook workflow uses `CatBoostClassifier`, which is a good fit for this dataset because it can handle categorical and numerical features in a compact pipeline.

Main steps:

1. Load `train.csv`, `test.csv`, and `sample_submission.csv`.
2. Prepare feature columns and the target column.
3. Define categorical features.
4. Train CatBoost on a `Pool`.
5. Predict probabilities for the test set.
6. Create a Kaggle submission file.

## React App

The interface is built with React and Vite. It includes:

- grouped borrower, loan, and credit history inputs
- a decision support panel with approval and default probability
- dataset summary metrics
- a live JSON payload preview for `POST /predict`
- local fallback scoring when the backend is not running

Expected backend response:

```json
{
  "prob_approved": 0.84,
  "prob_default": 0.16
}
```

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Project Structure

```text
.
├── index.html
├── package.json
├── src
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
└── README.md
```
