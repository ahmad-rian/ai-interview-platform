# frozen_string_literal: true

module Portfolios
  # One view of a portfolio skill for the API, the fit/gap report and the PDF.
  # level_source tells where the effective level comes from, which is the
  # visible record of human review:
  # - "assessor_override": an assessor set the level (with a note)
  # - "assessor_confirmed": an assessor confirmed the AI level
  # - "ai": the AI level, not reviewed
  # - nil: no level (not assessed and not rated by an assessor)
  class SkillPresenter
    def initialize(skill)
      @skill = skill
    end

    def effective_level
      override&.override_level || @skill.ai_level
    end

    def level_source
      return 'assessor_override' if override
      return nil if @skill.ai_level.nil?

      @skill.assessor_confirmed? ? 'assessor_confirmed' : 'ai'
    end

    def human_reviewed?
      %w[assessor_override assessor_confirmed].include?(level_source)
    end

    # The AI's confidence describes the AI level only; it is not shown next to
    # an assessor's level.
    def confidence
      level_source == 'assessor_override' ? nil : @skill.ai_confidence
    end

    def override
      @skill.assessor_override
    end

    def as_json(*)
      {
        id: @skill.id,
        skill_id: @skill.skill_id,
        skill_label: @skill.skill_label,
        is_discovered: @skill.is_discovered,
        rating_status: @skill.rating_status,
        not_assessed_reason: @skill.not_assessed_reason,
        coverage: { state: @skill.coverage_state, probe_count: @skill.probe_count },
        ai_level: @skill.ai_level,
        ai_confidence: @skill.ai_confidence,
        effective_level: effective_level,
        level_source: level_source,
        assessor_confirmed: @skill.assessor_confirmed?,
        evidence: @skill.evidence_quotes,
        competency_summary: @skill.competency_summary
      }
    end
  end
end
