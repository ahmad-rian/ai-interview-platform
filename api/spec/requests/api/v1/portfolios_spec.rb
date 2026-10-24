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

    it 'describes a not-assessed skill explicitly instead of giving it a level' do
      create(:portfolio_skill, portfolio: portfolio, skill_label: 'System Design', ai_level: nil, ai_confidence: nil,
                               rating_status: 'not_assessed', not_assessed_reason: 'not_covered', evidence: [])

      get "/api/v1/sessions/#{interview_session.id}/portfolio", headers: auth_headers_for(organization)

      skill = response.parsed_body.dig('portfolio', 'skills').find { |s| s['skill_label'] == 'System Design' }
      expect(skill).to include('rating_status' => 'not_assessed', 'not_assessed_reason' => 'not_covered',
                               'ai_level' => nil, 'ai_confidence' => nil)
    end

    it 'exposes an error code and a safe message for a failed portfolio, never the raw error (AC-80)' do
      portfolio.update!(generation_status: 'failed', generation_error_code: 'provider_denied',
                        generation_error: 'Gemini::HttpClient::ApiError: API returned 403: Kandidat Contoh Rahasia')

      get "/api/v1/sessions/#{interview_session.id}/portfolio", headers: auth_headers_for(organization)

      expect(response.body).not_to include('Kandidat Contoh Rahasia')
      expect(response.body).not_to include('ApiError')
      expect(response.parsed_body).not_to have_key('error')
      expect(response.parsed_body['portfolio']).not_to have_key('generation_error')
      expect(response.parsed_body['portfolio']).to include('generation_error_code' => 'provider_denied',
                                                           'generation_error_message' => be_present)
    end

    it 'tells the client whether ratings were validated (legacy portfolios, AC-14)' do
      portfolio.update!(ratings_validated: false)

      get "/api/v1/sessions/#{interview_session.id}/portfolio", headers: auth_headers_for(organization)

      expect(response.parsed_body.dig('portfolio', 'ratings_validated')).to be(false)
    end
  end
end
