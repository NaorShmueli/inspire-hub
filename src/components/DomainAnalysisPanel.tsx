import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Layers,
  Box,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Link2,
  Shield,
  Scale,
  Workflow,
  Users,
  Gauge,
} from "lucide-react";
import type { DomainAnalysisResult, UpdatedDomain, RoundAnalysisModel } from "@/lib/api-types";

interface DomainAnalysisPanelProps {
  domainAnalysis?: DomainAnalysisResult | null;
  domains?: UpdatedDomain[];
  analysis?: RoundAnalysisModel;
}

export function DomainAnalysisPanel({
  domainAnalysis,
  domains = [],
  analysis,
}: DomainAnalysisPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["domains"])
  );
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const toggleDomain = (domainName: string) => {
    setExpandedDomains((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(domainName)) {
        newSet.delete(domainName);
      } else {
        newSet.add(domainName);
      }
      return newSet;
    });
  };

  // Check if we have any domain analysis data
  const hasDomainAnalysis = domainAnalysis && (
    domainAnalysis.analysis_summary ||
    (domainAnalysis.identified_domains && domainAnalysis.identified_domains.length > 0) ||
    domainAnalysis.recommended_microservices_count
  );

  const hasSimpleDomains = domains && domains.length > 0;

  if (!hasDomainAnalysis && !hasSimpleDomains) {
    return null;
  }

  const SectionHeader = ({
    id,
    icon: Icon,
    title,
    count,
    color = "primary",
  }: {
    id: string;
    icon: React.ElementType;
    title: string;
    count?: number;
    color?: string;
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors rounded-lg"
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 text-${color}`} />
        <span className="text-sm font-medium">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {expandedSections.has(id) ? (
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
      {/* Analysis Summary Header */}
      {domainAnalysis?.analysis_summary && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Domain Analysis Results</h4>
              <p className="text-xs text-muted-foreground">
                AI-powered architecture assessment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {domainAnalysis.analysis_summary.total_domains_identified || 0}
              </div>
              <div className="text-xs text-muted-foreground">Domains</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {Math.round((domainAnalysis.analysis_summary.confidence_score || 0) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {domainAnalysis.recommended_microservices_count?.optimal || "—"}
              </div>
              <div className="text-xs text-muted-foreground">Services</div>
            </div>
          </div>

          {domainAnalysis.analysis_summary.reasoning && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {domainAnalysis.analysis_summary.reasoning}
            </p>
          )}
        </div>
      )}

      {/* Recommended Microservices */}
      {domainAnalysis?.recommended_microservices_count && (
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <SectionHeader
            id="microservices"
            icon={Layers}
            title="Recommended Microservices"
            count={domainAnalysis.recommended_microservices_count.optimal}
          />
          <AnimatePresence>
            {expandedSections.has("microservices") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-3">
                  <div className="flex justify-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Minimum</div>
                      <div className="text-xl font-bold text-muted-foreground">
                        {domainAnalysis.recommended_microservices_count.minimum}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-primary mb-1">Optimal</div>
                      <div className="text-3xl font-bold text-primary">
                        {domainAnalysis.recommended_microservices_count.optimal}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Maximum</div>
                      <div className="text-xl font-bold text-muted-foreground">
                        {domainAnalysis.recommended_microservices_count.maximum}
                      </div>
                    </div>
                  </div>

                  {domainAnalysis.recommended_microservices_count.rationale && (
                    <p className="text-xs text-muted-foreground text-center">
                      {domainAnalysis.recommended_microservices_count.rationale}
                    </p>
                  )}

                  {domainAnalysis.recommended_microservices_count.optimal_service_names &&
                    domainAnalysis.recommended_microservices_count.optimal_service_names.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center pt-2">
                        {domainAnalysis.recommended_microservices_count.optimal_service_names.map(
                          (name, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-lg font-medium flex items-center gap-1.5"
                            >
                              <Box className="w-3 h-3" />
                              {name}
                            </span>
                          )
                        )}
                      </div>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Identified Domains */}
      {domainAnalysis?.identified_domains && domainAnalysis.identified_domains.length > 0 && (
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <SectionHeader
            id="domains"
            icon={Target}
            title="Identified Domains"
            count={domainAnalysis.identified_domains.length}
          />
          <AnimatePresence>
            {expandedSections.has("domains") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-2">
                  {domainAnalysis.identified_domains.map((domain, i) => {
                    const isExpanded = expandedDomains.has(domain.domain_name || `domain-${i}`);
                    return (
                      <div
                        key={i}
                        className="rounded-lg bg-secondary/30 border border-border/30 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleDomain(domain.domain_name || `domain-${i}`)}
                          className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{domain.domain_name}</span>
                            <span className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                              {domain.estimated_entities} entities
                            </span>
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {Math.round((domain.confidence || 0) * 100)}%
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-border/30"
                            >
                              <div className="p-3 space-y-3 text-xs">
                                {domain.description && (
                                  <p className="text-muted-foreground">{domain.description}</p>
                                )}

                                {domain.business_capability && (
                                  <div>
                                    <span className="font-medium text-foreground">
                                      Business Capability:
                                    </span>
                                    <p className="text-muted-foreground mt-0.5">
                                      {domain.business_capability}
                                    </p>
                                  </div>
                                )}

                                {domain.key_responsibilities &&
                                  domain.key_responsibilities.length > 0 && (
                                    <div>
                                      <span className="font-medium text-foreground">
                                        Key Responsibilities:
                                      </span>
                                      <ul className="mt-1 space-y-1 text-muted-foreground">
                                        {domain.key_responsibilities.map((resp, j) => (
                                          <li key={j} className="flex items-start gap-1.5">
                                            <span className="text-primary mt-0.5">•</span>
                                            {resp}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                {domain.probable_entities &&
                                  domain.probable_entities.length > 0 && (
                                    <div>
                                      <span className="font-medium text-foreground">Entities:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {domain.probable_entities.map((entity, j) => (
                                          <span
                                            key={j}
                                            className="px-2 py-0.5 bg-primary/10 text-primary rounded flex items-center gap-1"
                                          >
                                            <Box className="w-3 h-3" />
                                            {entity}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                {domain.user_types_served &&
                                  domain.user_types_served.length > 0 && (
                                    <div>
                                      <span className="font-medium text-foreground flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        Users Served:
                                      </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {domain.user_types_served.map((user, j) => (
                                          <span
                                            key={j}
                                            className="px-2 py-0.5 bg-secondary text-muted-foreground rounded"
                                          >
                                            {user}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Domain Relationships */}
      {domainAnalysis?.domain_relationships && domainAnalysis.domain_relationships.length > 0 && (
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <SectionHeader
            id="relationships"
            icon={Workflow}
            title="Domain Relationships"
            count={domainAnalysis.domain_relationships.length}
          />
          <AnimatePresence>
            {expandedSections.has("relationships") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-2">
                  {domainAnalysis.domain_relationships.map((rel, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="font-medium text-primary">{rel.from_domain}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium text-primary">{rel.to_domain}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs mb-2">
                        {rel.relationship_type && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {rel.relationship_type}
                          </span>
                        )}
                        {rel.interaction_pattern && (
                          <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded">
                            {rel.interaction_pattern}
                          </span>
                        )}
                      </div>
                      {rel.description && (
                        <p className="text-xs text-muted-foreground">{rel.description}</p>
                      )}
                      {rel.data_shared && rel.data_shared.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs text-muted-foreground">Shared:</span>
                          {rel.data_shared.map((data, j) => (
                            <span
                              key={j}
                              className="px-1.5 py-0.5 bg-background/80 text-xs rounded"
                            >
                              {data}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Cross-Cutting Concerns */}
      {domainAnalysis?.cross_cutting_concerns && domainAnalysis.cross_cutting_concerns.length > 0 && (
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <SectionHeader
            id="concerns"
            icon={Shield}
            title="Cross-Cutting Concerns"
            count={domainAnalysis.cross_cutting_concerns.length}
          />
          <AnimatePresence>
            {expandedSections.has("concerns") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-2">
                  {domainAnalysis.cross_cutting_concerns.map((concern, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <div className="font-medium text-sm mb-1">{concern.concern}</div>
                      {concern.affected_domains && concern.affected_domains.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {concern.affected_domains.map((domain, j) => (
                            <span
                              key={j}
                              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                            >
                              {domain}
                            </span>
                          ))}
                        </div>
                      )}
                      {concern.recommendation && (
                        <p className="text-xs text-muted-foreground">{concern.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Integration Points */}
      {domainAnalysis?.integration_points && domainAnalysis.integration_points.length > 0 && (
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <SectionHeader
            id="integrations"
            icon={Link2}
            title="Integration Points"
            count={domainAnalysis.integration_points.length}
          />
          <AnimatePresence>
            {expandedSections.has("integrations") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-2">
                  {domainAnalysis.integration_points.map((point, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{point.external_system}</span>
                        {point.criticality && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
                              point.criticality.toLowerCase() === "high"
                                ? "bg-destructive/20 text-destructive"
                                : point.criticality.toLowerCase() === "medium"
                                ? "bg-yellow-500/20 text-yellow-600"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {point.criticality}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {point.integrating_domain && (
                          <div>
                            <span className="font-medium">Domain:</span> {point.integrating_domain}
                          </div>
                        )}
                        {point.integration_type && (
                          <div>
                            <span className="font-medium">Type:</span> {point.integration_type}
                          </div>
                        )}
                        {point.purpose && (
                          <div>
                            <span className="font-medium">Purpose:</span> {point.purpose}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Potential Issues */}
      {domainAnalysis?.potential_issues && domainAnalysis.potential_issues.length > 0 && (
        <div className="rounded-xl bg-card border border-destructive/30 overflow-hidden">
          <SectionHeader
            id="issues"
            icon={AlertTriangle}
            title="Potential Issues"
            count={domainAnalysis.potential_issues.length}
            color="destructive"
          />
          <AnimatePresence>
            {expandedSections.has("issues") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-2">
                  {domainAnalysis.potential_issues.map((issue, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{issue.issue}</span>
                        {issue.severity && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
                              issue.severity.toLowerCase() === "high"
                                ? "bg-destructive/20 text-destructive"
                                : issue.severity.toLowerCase() === "medium"
                                ? "bg-yellow-500/20 text-yellow-600"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {issue.severity}
                          </span>
                        )}
                      </div>
                      {issue.description && (
                        <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                      )}
                      {issue.recommendation && (
                        <div className="text-xs">
                          <span className="font-medium text-primary">Recommendation:</span>{" "}
                          <span className="text-muted-foreground">{issue.recommendation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Scale Considerations */}
      {domainAnalysis?.scale_considerations && (
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <SectionHeader id="scale" icon={Scale} title="Scale Considerations" />
          <AnimatePresence>
            {expandedSections.has("scale") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-3 text-xs">
                  {domainAnalysis.scale_considerations.expected_load && (
                    <div>
                      <span className="font-medium">Expected Load:</span>{" "}
                      <span className="text-muted-foreground">
                        {domainAnalysis.scale_considerations.expected_load}
                      </span>
                    </div>
                  )}

                  {domainAnalysis.scale_considerations.high_traffic_domains &&
                    domainAnalysis.scale_considerations.high_traffic_domains.length > 0 && (
                      <div>
                        <span className="font-medium">High Traffic Domains:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {domainAnalysis.scale_considerations.high_traffic_domains.map(
                            (domain, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-primary/10 text-primary rounded"
                              >
                                {domain}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {domainAnalysis.scale_considerations.recommendations &&
                    domainAnalysis.scale_considerations.recommendations.length > 0 && (
                      <div>
                        <span className="font-medium">Recommendations:</span>
                        <ul className="mt-1 space-y-1 text-muted-foreground">
                          {domainAnalysis.scale_considerations.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Compliance Impacts */}
      {domainAnalysis?.compliance_impacts && domainAnalysis.compliance_impacts.length > 0 && (
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <SectionHeader
            id="compliance"
            icon={Shield}
            title="Compliance Impacts"
            count={domainAnalysis.compliance_impacts.length}
          />
          <AnimatePresence>
            {expandedSections.has("compliance") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-2">
                  {domainAnalysis.compliance_impacts.map((impact, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <div className="font-medium text-sm mb-2">{impact.regulation}</div>
                      {impact.affected_domains && impact.affected_domains.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {impact.affected_domains.map((domain, j) => (
                            <span
                              key={j}
                              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                            >
                              {domain}
                            </span>
                          ))}
                        </div>
                      )}
                      {impact.requirements && impact.requirements.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-1 mb-2">
                          {impact.requirements.map((req, j) => (
                            <li key={j} className="flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      )}
                      {impact.architectural_impact && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Architectural Impact:</span>{" "}
                          {impact.architectural_impact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Fallback: Simple Domains (when no detailed analysis) */}
      {!hasDomainAnalysis && hasSimpleDomains && (
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <SectionHeader id="domains" icon={Layers} title="Identified Domains" count={domains.length} />
          <AnimatePresence>
            {expandedSections.has("domains") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-2">
                  {domains.map((domain, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{domain.domain_name}</span>
                        <span className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                          {domain.estimated_entities} entities
                        </span>
                      </div>
                      {domain.changes && (
                        <p className="text-xs text-muted-foreground mb-2">{domain.changes}</p>
                      )}
                      {domain.new_probable_entities && domain.new_probable_entities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {domain.new_probable_entities.map((entity, j) => (
                            <span
                              key={j}
                              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded flex items-center gap-1"
                            >
                              <Box className="w-3 h-3" />
                              {entity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default DomainAnalysisPanel;
