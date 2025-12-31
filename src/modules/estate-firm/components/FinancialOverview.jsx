import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar,
  Download, Filter, PieChart, BarChart3,
  CreditCard, Wallet, Receipt, Target,
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import './FinancialOverview.css';

const FinancialOverview = ({ properties, dashboardStats }) => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [viewMode, setViewMode] = useState('chart');

  // Calculate financial metrics
  const totalAnnualRent = properties.reduce((sum, prop) => sum + prop.rentAmount, 0);
  const monthlyRevenue = totalAnnualRent / 12;
  const totalCommission = properties.reduce((sum, prop) => {
    return sum + (prop.rentAmount * (prop.commissionRate / 100));
  }, 0);
  const monthlyCommission = totalCommission / 12;

  // Mock transaction data
  const transactions = [
    { id: 1, date: '2024-12-01', description: 'Rent Collection - Lekki Duplex', amount: 2500000, type: 'income', status: 'completed' },
    { id: 2, date: '2024-11-30', description: 'Maintenance Payment', amount: 150000, type: 'expense', status: 'completed' },
    { id: 3, date: '2024-11-28', description: 'Commission - Office Space VI', amount: 600000, type: 'income', status: 'pending' },
    { id: 4, date: '2024-11-25', description: 'Advertising Expense', amount: 50000, type: 'expense', status: 'completed' },
    { id: 5, date: '2024-11-20', description: 'Rent Collection - Ikeja Flat', amount: 1200000, type: 'income', status: 'completed' },
  ];

  const pendingPayments = properties.filter(p => {
    const dueDate = new Date(p.rentDueDate);
    const today = new Date();
    return dueDate < today && p.status === 'occupied';
  }).length;

  const upcomingPayments = properties.filter(p => {
    const dueDate = new Date(p.rentDueDate);
    const today = new Date();
    const nextWeek = new Date(today.setDate(today.getDate() + 7));
    return dueDate <= nextWeek && p.status === 'occupied';
  }).length;

  const handleExportReport = () => {
    console.log('Export financial report');
  };

  const handleGenerateInvoice = () => {
    console.log('Generate invoice');
  };

  return (
    <div className="financial-overview">
      {/* Header */}
      <div className="manager-header">
        <div>
          <h2>Financial Overview</h2>
          <p className="subtitle">
            Track revenue, expenses, and financial performance
          </p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleGenerateInvoice}>
            <Receipt size={18} />
            Generate Invoice
          </button>
          <button className="btn btn-outline" onClick={handleExportReport}>
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="financial-summary">
        <div className="summary-card income">
          <div className="card-icon">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Monthly Revenue</span>
            <span className="card-value">₦{monthlyRevenue.toLocaleString()}</span>
            <div className="card-trend">
              <ArrowUpRight size={14} />
              <span>+12% from last month</span>
            </div>
          </div>
        </div>

        <div className="summary-card commission">
          <div className="card-icon">
            <Wallet size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Monthly Commission</span>
            <span className="card-value">₦{monthlyCommission.toLocaleString()}</span>
            <div className="card-trend">
              <ArrowUpRight size={14} />
              <span>+8% from last month</span>
            </div>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="card-icon">
            <CreditCard size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Pending Payments</span>
            <span className="card-value">{pendingPayments}</span>
            <div className="card-trend">
              <span>₦{pendingPayments * 2000000} total value</span>
            </div>
          </div>
        </div>

        <div className="summary-card upcoming">
          <div className="card-icon">
            <Calendar size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Upcoming Payments</span>
            <span className="card-value">{upcomingPayments}</span>
            <div className="card-trend">
              <span>Next 7 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="financial-controls">
        <div className="time-range">
          {['weekly', 'monthly', 'quarterly', 'yearly'].map(range => (
            <button
              key={range}
              className={`range-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            <PieChart size={16} />
            Charts
          </button>
          <button 
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <BarChart3 size={16} />
            Table
          </button>
        </div>
      </div>

      {/* Charts & Graphs */}
      {viewMode === 'chart' && (
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-header">
              <h4>Revenue Breakdown</h4>
              <select className="chart-filter">
                <option>By Property Type</option>
                <option>By Client</option>
                <option>By Location</option>
              </select>
            </div>
            <div className="chart-placeholder">
              <PieChart size={48} />
              <p>Revenue distribution chart</p>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h4>Monthly Trend</h4>
              <span className="trend-indicator positive">
                <ArrowUpRight size={14} />
                +15% growth
              </span>
            </div>
            <div className="chart-placeholder">
              <TrendingUp size={48} />
              <p>Monthly revenue trend chart</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="btn btn-sm">
            <Filter size={14} />
            Filter
          </button>
        </div>

        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td>
                    <span className={`amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      ₦{transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`type-badge ${transaction.type}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon-sm">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Targets */}
      <div className="targets-section">
        <div className="section-header">
          <h3>Financial Targets</h3>
          <Target size={20} />
        </div>
        
        <div className="targets-grid">
          <div className="target-card">
            <div className="target-header">
              <span className="target-label">Monthly Revenue Target</span>
              <span className="target-value">₦5,000,000</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(monthlyRevenue / 5000000) * 100}%` }}
              ></div>
            </div>
            <div className="target-progress">
              <span>{((monthlyRevenue / 5000000) * 100).toFixed(1)}% achieved</span>
              <span>₦{monthlyRevenue.toLocaleString()} / ₦5,000,000</span>
            </div>
          </div>

          <div className="target-card">
            <div className="target-header">
              <span className="target-label">Client Acquisition</span>
              <span className="target-value">5 new clients</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '60%' }}></div>
            </div>
            <div className="target-progress">
              <span>60% achieved</span>
              <span>3 / 5 clients</span>
            </div>
          </div>

          <div className="target-card">
            <div className="target-header">
              <span className="target-label">Portfolio Growth</span>
              <span className="target-value">20 properties</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '25%' }}></div>
            </div>
            <div className="target-progress">
              <span>25% achieved</span>
              <span>5 / 20 properties</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;