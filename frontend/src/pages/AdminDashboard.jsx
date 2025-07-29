// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, TrendingUp, DollarSign, Target, 
  Calendar, Download, RefreshCw, AlertCircle
} from 'lucide-react';
import { monetizationService } from '../services/monetizationService';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const [kpiData, setKpiData] = useState(null);
  const [conversionMetrics, setConversionMetrics] = useState(null);
  const [featureUsage, setFeatureUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [kpi, conversion, usage] = await Promise.all([
        fetchKPIData(),
        fetchConversionMetrics(),
        fetchFeatureUsage()
      ]);
      
      setKpiData(kpi);
      setConversionMetrics(conversion);
      setFeatureUsage(usage);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIData = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/analytics/kpi`, {
      headers: {
        'Authorization': `Bearer ${monetizationService.token}`
      }
    });
    
    if (!response.ok) throw new Error('Erreur KPI');
    return response.json();
  };

  const fetchConversionMetrics = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/analytics/conversion-metrics?period=${selectedPeriod}`, {
      headers: {
        'Authorization': `Bearer ${monetizationService.token}`
      }
    });
    
    if (!response.ok) throw new Error('Erreur métriques conversion');
    return response.json();
  };

  const fetchFeatureUsage = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/analytics/feature-usage?days=${selectedPeriod}`, {
      headers: {
        'Authorization': `Bearer ${monetizationService.token}`
      }
    });
    
    if (!response.ok) throw new Error('Erreur usage fonctionnalités');
    return response.json();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const SUBSCRIPTION_COLORS = {
    free: '#94a3b8',
    premium: '#667eea',
    therapy: '#f093fb'
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <RefreshCw className="spinning" size={32} />
          <p>Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-button">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const subscriptionData = kpiData ? [
    { name: 'Gratuit', value: kpiData.users.free, color: SUBSCRIPTION_COLORS.free },
    { name: 'Premium', value: kpiData.users.premium, color: SUBSCRIPTION_COLORS.premium },
    { name: 'Thérapie', value: kpiData.users.therapy, color: SUBSCRIPTION_COLORS.therapy }
  ] : [];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Analytics Olivia</h1>
        <div className="header-controls">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="period-select"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
          </select>
          <button onClick={loadDashboardData} className="refresh-button">
            <RefreshCw size={16} />
            Actualiser
          </button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="kpi-cards">
        <div className="kpi-card revenue">
          <div className="kpi-icon">
            <DollarSign size={24} />
          </div>
          <div className="kpi-content">
            <h3>MRR</h3>
            <p className="kpi-value">{formatCurrency(kpiData?.mrr || 0)}</p>
            <span className="kpi-label">Revenus récurrents mensuels</span>
          </div>
        </div>

        <div className="kpi-card users">
          <div className="kpi-icon">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <h3>Utilisateurs Total</h3>
            <p className="kpi-value">{kpiData?.users.total || 0}</p>
            <span className="kpi-label">Utilisateurs inscrits</span>
          </div>
        </div>

        <div className="kpi-card conversion">
          <div className="kpi-icon">
            <Target size={24} />
          </div>
          <div className="kpi-content">
            <h3>Taux de Conversion</h3>
            <p className="kpi-value">{kpiData?.metrics.conversion_rate || '0%'}</p>
            <span className="kpi-label">Gratuit → Premium</span>
          </div>
        </div>

        <div className="kpi-card signups">
          <div className="kpi-icon">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <h3>Inscriptions</h3>
            <p className="kpi-value">{kpiData?.metrics.signups_last_month || 0}</p>
            <span className="kpi-label">Ce mois-ci</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Répartition des abonnements */}
        <div className="dashboard-card">
          <h3>Répartition des Abonnements</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Métriques de conversion quotidiennes */}
        <div className="dashboard-card">
          <h3>Conversions Quotidiennes</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionMetrics?.daily_metrics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="signups" stroke="#94a3b8" name="Inscriptions" />
                <Line type="monotone" dataKey="conversions" stroke="#667eea" name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage des fonctionnalités */}
        <div className="dashboard-card">
          <h3>Usage des Fonctionnalités</h3>
          <div className="chart-container">
            {featureUsage && Object.keys(featureUsage.feature_usage).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(featureUsage.feature_usage).map(([key, value]) => ({
                  name: key.replace('_', ' '),
                  total: value.total_usage,
                  users: value.unique_users
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#667eea" name="Utilisation totale" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>Aucune donnée d'usage disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Métriques détaillées */}
        <div className="dashboard-card">
          <h3>Détails des Métriques</h3>
          <div className="metrics-table">
            <div className="metric-row">
              <span className="metric-label">Inscriptions ({selectedPeriod}j)</span>
              <span className="metric-value">{conversionMetrics?.overview.total_signups || 0}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Conversions ({selectedPeriod}j)</span>
              <span className="metric-value">{conversionMetrics?.overview.total_conversions || 0}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Checkouts initiés</span>
              <span className="metric-value">{conversionMetrics?.overview.total_checkouts || 0}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Conversion checkout</span>
              <span className="metric-value">{conversionMetrics?.overview.checkout_conversion_rate || 0}%</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Churn ({selectedPeriod}j)</span>
              <span className="metric-value">{kpiData?.metrics.churn_last_month || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <p>Dernière mise à jour: {kpiData?.updated_at ? new Date(kpiData.updated_at).toLocaleString('fr-FR') : 'Inconnue'}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;