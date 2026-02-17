import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg') # Fix for threading issues on Windows/Flask
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
import os
from datetime import datetime

def run_analysis(file_path, granularity='weekly'):
    # 1. Load Data
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    
    df = pd.read_csv(file_path)
    
    # Flexible Column Mapping
    col_map = {
        'date': 'Date', 'Date': 'Date', 'timestamp': 'Date',
        'total_revenue': 'Sales', 'Sales': 'Sales', 'amount': 'Amount',
        'type': 'Type', 'Type': 'Type',
        'category': 'Category', 'Category': 'Category'
    }
    df = df.rename(columns=lambda x: col_map.get(x.lower(), x))
    
    # Ensure Date column
    if 'Date' not in df.columns:
        date_cols = [c for c in df.columns if 'date' in c.lower() or 'time' in c.lower()]
        if date_cols: df = df.rename(columns={date_cols[0]: 'Date'})
    
    if 'Date' not in df.columns: return {"error": "Missing Date column"}
    df['Date'] = pd.to_datetime(df['Date'])

    # Handle Amount/Type if missing
    if 'Amount' not in df.columns and 'Sales' in df.columns:
        df = df.rename(columns={'Sales': 'Amount'})
        df['Type'] = 'Sale'
    
    if 'Type' not in df.columns: df['Type'] = 'Sale' # Default

    # 2. Multi-Series Aggregation
    df = df.sort_values('Date')
    
    # Calculate Sales and Expenses series
    sales_df = df[df['Type'].str.contains('Sale', case=False, na=False)].copy()
    expense_df = df[df['Type'].str.contains('Expense', case=False, na=False)].copy()
    
    freq_map = {'daily': 'D', 'weekly': 'W', 'monthly': 'M'}
    freq = freq_map.get(granularity, 'W')

    sales_resampled = sales_df.set_index('Date')['Amount'].resample(freq).sum().reset_index().rename(columns={'Amount': 'Sales'})
    expense_resampled = expense_df.set_index('Date')['Amount'].resample(freq).sum().reset_index().rename(columns={'Amount': 'Expenses'})
    
    # Merge series
    resampled_df = pd.merge(sales_resampled, expense_resampled, on='Date', how='outer').fillna(0)
    resampled_df['Profit'] = resampled_df['Sales'] - resampled_df['Expenses']
    resampled_df = resampled_df.sort_values('Date')

    # 3. Category Breakdown
    cat_breakdown = []
    if 'Category' in df.columns:
        exp_cats = expense_df.groupby('Category')['Amount'].sum().sort_values(ascending=False).reset_index()
        cat_breakdown = [{"category": row['Category'], "amount": float(row['Amount'])} for _, row in exp_cats.iterrows()]

    # 4. AI Forecasting (Linear Regression for each series)
    resampled_df['Date_Ordinal'] = resampled_df['Date'].map(datetime.toordinal)
    
    def get_forecast(series_name, periods=8):
        y = resampled_df[series_name].values
        X = resampled_df[['Date_Ordinal']].values
        if len(y[y != 0]) < 2: return [float(y[-1] if len(y) > 0 else 0)] * periods, 0
        
        model = LinearRegression()
        model.fit(X, y)
        
        delta = {'D': 1, 'W': 7, 'M': 30}[freq]
        last_date = resampled_df['Date'].max()
        future_dates = [last_date + pd.Timedelta(days=delta * (i+1)) for i in range(periods)]
        future_ordinals = np.array([d.toordinal() for d in future_dates]).reshape(-1, 1)
        
        preds = model.predict(future_ordinals)
        
        # Add a seasonal "realistic" touch (sine wave + noise)
        # Periodicity: 4 for Weekly, 30 for Daily, 12 for Monthly
        period = 4 if freq == 'W' else 30 if freq == 'D' else 6
        amplitude = np.std(y) * 0.2 if len(y) > 0 and np.std(y) > 0 else (np.mean(y) * 0.1 if len(y) > 0 else 100)
        
        real_preds = []
        for i, v in enumerate(preds):
            seasonal = amplitude * np.sin(2 * np.pi * (i + len(y)) / period)
            noise = (np.random.random() - 0.5) * amplitude * 0.5
            real_preds.append(max(0, float(v + seasonal + noise)))

        return [{"date": d.strftime('%Y-%m-%d'), "value": v} for d, v in zip(future_dates, real_preds)], model.coef_[0]

    sales_forecast, sales_slope = get_forecast('Sales')
    exp_forecast, _ = get_forecast('Expenses')
    profit_forecast, _ = get_forecast('Profit')

    # 5. Raw Data for Chart.js
    historical_data = [
        {
            "date": d.strftime('%Y-%m-%d'), 
            "sales": float(s), 
            "expenses": float(e),
            "profit": float(p)
        } 
        for d, s, e, p in zip(resampled_df['Date'], resampled_df['Sales'], resampled_df['Expenses'], resampled_df['Profit'])
    ]

    # Insights
    delta_days = {'D': 1, 'W': 7, 'M': 30}[freq]
    insights = []
    if sales_slope > 0:
        insights.append(f"✔ Sales Trend: Growing at ₹{int(sales_slope * delta_days)} per period")
    else:
        insights.append(f"⚠ Sales Trend: Declining at ₹{int(abs(sales_slope * delta_days))} per period")

    total_sales = resampled_df['Sales'].sum()
    total_profit = resampled_df['Profit'].sum()

    return {
        "total_stats": {
            "sales": float(total_sales),
            "expenses": float(resampled_df['Expenses'].sum()),
            "profit": float(total_profit),
            "margin": float(total_profit / total_sales * 100) if total_sales > 0 else 0
        },
        "historical": historical_data,
        "forecast": {
            "sales": sales_forecast,
            "expenses": exp_forecast,
            "profit": profit_forecast
        },
        "category_breakdown": cat_breakdown,
        "insights": insights
    }

if __name__ == "__main__":
    # Test run
    # result = run_analysis("sales_data.csv")
    pass
