# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Portfolios API' do
  describe 'GET /api/v1/sessions/:id/portfolio' do
    let(:organization)      { create(:organization) }
    let(:interview_session) { create(:session, assessment: create(:assessment, organization: organization)) }
    let!(:portfolio)        { create(:portfolio, session: interview_session) }

    before { create(:portfolio_skill, portfolio: portfolio, skill_label: 'Ruby on Rails', ai_level: 3) }

    it 'returns the portfolio of a session that belongs to the caller tenant' do
      get "/api/v1/sessions/#{interview_session.id}/portfolio", headers: auth_headers_for(organization)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig('portfolio', 'id')).to eq(portfolio.id)
      expect(response.parsed_body.dig('portfolio', 'skills').pluck('skill_label')).to eq(['Ruby on Rails'])
    end
  end
end
