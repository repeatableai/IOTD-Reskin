CREATE TABLE "collaboration_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" varchar,
	"user_id" varchar,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" varchar,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_signals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" varchar,
	"platform" varchar NOT NULL,
	"signal_type" varchar NOT NULL,
	"name" varchar NOT NULL,
	"member_count" integer,
	"engagement_score" integer,
	"url" varchar,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'new',
	"user_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "export_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"idea_id" varchar,
	"export_type" varchar NOT NULL,
	"export_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "faq_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar DEFAULT 'general',
	"order" integer DEFAULT 0,
	"helpful" integer DEFAULT 0,
	"not_helpful" integer DEFAULT 0,
	"is_published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "icp_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" varchar,
	"user_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"profile_data" jsonb NOT NULL,
	"validation_priority" varchar DEFAULT 'medium',
	"confidence" integer DEFAULT 50,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "idea_claims" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" varchar,
	"user_id" varchar,
	"status" varchar DEFAULT 'active',
	"progress" integer DEFAULT 0,
	"milestones" jsonb,
	"notes" text,
	"claimed_at" timestamp DEFAULT now(),
	"released_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "idea_tags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" varchar,
	"tag_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"slug" varchar NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"image_url" varchar,
	"type" varchar NOT NULL,
	"market" varchar NOT NULL,
	"target_audience" text,
	"main_competitor" varchar,
	"keyword" varchar,
	"keyword_volume" integer,
	"keyword_growth" varchar,
	"opportunity_score" integer NOT NULL,
	"opportunity_label" varchar NOT NULL,
	"problem_score" integer NOT NULL,
	"problem_label" varchar NOT NULL,
	"feasibility_score" integer NOT NULL,
	"feasibility_label" varchar NOT NULL,
	"timing_score" integer NOT NULL,
	"timing_label" varchar NOT NULL,
	"execution_score" integer NOT NULL,
	"gtm_score" integer NOT NULL,
	"revenue_potential" text,
	"revenue_potential_num" integer,
	"execution_difficulty" text,
	"gtm_strength" text,
	"view_count" integer DEFAULT 0,
	"save_count" integer DEFAULT 0,
	"vote_count" integer DEFAULT 0,
	"is_published" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"is_gregs_pick" boolean DEFAULT false,
	"created_by" varchar,
	"source_type" varchar DEFAULT 'curated',
	"source_data" text,
	"builder_url" varchar,
	"preview_url" varchar,
	"offer_tiers" jsonb,
	"why_now_analysis" text,
	"proof_signals" text,
	"market_gap" text,
	"execution_plan" text,
	"framework_data" jsonb,
	"trend_analysis" text,
	"storytelling_narrative" text,
	"keyword_data" jsonb,
	"builder_prompts" jsonb,
	"community_signals" jsonb,
	"signal_badges" text[],
	"claimed_by" varchar,
	"claimed_at" timestamp,
	"claim_count" integer DEFAULT 0,
	"max_claim_slots" integer DEFAULT 5,
	"claim_progress" integer DEFAULT 0,
	"claim_milestones" jsonb,
	"average_rating" numeric(3, 2),
	"rating_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ideas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "import_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"status" varchar NOT NULL,
	"total_rows" integer NOT NULL,
	"processed_rows" integer DEFAULT 0,
	"successful_rows" integer DEFAULT 0,
	"failed_rows" integer DEFAULT 0,
	"errors" jsonb,
	"results" jsonb,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "research_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"idea_id" varchar,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"industry" varchar,
	"target_market" varchar,
	"status" varchar DEFAULT 'pending',
	"priority" varchar DEFAULT 'normal',
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"color" varchar DEFAULT '#3B82F6',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tools_library" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"url" varchar,
	"image_url" varchar,
	"is_premium" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"is_new" boolean DEFAULT false,
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_idea_interactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"idea_id" varchar,
	"is_interested" boolean DEFAULT false,
	"is_not_interested" boolean DEFAULT false,
	"is_building" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_idea_ratings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"idea_id" varchar,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_idea_votes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"idea_id" varchar,
	"vote_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_saved_ideas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"idea_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_tool_favorites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"tool_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "validation_contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" varchar,
	"user_id" varchar,
	"icp_profile_id" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar,
	"phone" varchar,
	"linkedin_url" varchar,
	"job_title" varchar NOT NULL,
	"company" varchar NOT NULL,
	"company_size" varchar,
	"industry" varchar,
	"region" varchar NOT NULL,
	"compliance_flags" jsonb DEFAULT '[]'::jsonb,
	"consent_status" varchar DEFAULT 'unknown',
	"match_score" integer,
	"source" varchar DEFAULT 'manual',
	"validation_status" varchar DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "validation_scripts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" varchar,
	"user_id" varchar,
	"icp_profile_id" varchar,
	"title" varchar NOT NULL,
	"script_type" varchar DEFAULT 'discovery',
	"objective" text,
	"total_duration" varchar,
	"script_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_signals" ADD CONSTRAINT "community_signals_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_history" ADD CONSTRAINT "export_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_history" ADD CONSTRAINT "export_history_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icp_profiles" ADD CONSTRAINT "icp_profiles_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icp_profiles" ADD CONSTRAINT "icp_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_claims" ADD CONSTRAINT "idea_claims_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_claims" ADD CONSTRAINT "idea_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_tags" ADD CONSTRAINT "idea_tags_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_tags" ADD CONSTRAINT "idea_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_claimed_by_users_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_requests" ADD CONSTRAINT "research_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_requests" ADD CONSTRAINT "research_requests_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_idea_interactions" ADD CONSTRAINT "user_idea_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_idea_interactions" ADD CONSTRAINT "user_idea_interactions_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_idea_ratings" ADD CONSTRAINT "user_idea_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_idea_ratings" ADD CONSTRAINT "user_idea_ratings_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_idea_votes" ADD CONSTRAINT "user_idea_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_idea_votes" ADD CONSTRAINT "user_idea_votes_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_saved_ideas" ADD CONSTRAINT "user_saved_ideas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_saved_ideas" ADD CONSTRAINT "user_saved_ideas_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tool_favorites" ADD CONSTRAINT "user_tool_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tool_favorites" ADD CONSTRAINT "user_tool_favorites_tool_id_tools_library_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools_library"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_contacts" ADD CONSTRAINT "validation_contacts_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_contacts" ADD CONSTRAINT "validation_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_contacts" ADD CONSTRAINT "validation_contacts_icp_profile_id_icp_profiles_id_fk" FOREIGN KEY ("icp_profile_id") REFERENCES "public"."icp_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_scripts" ADD CONSTRAINT "validation_scripts_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_scripts" ADD CONSTRAINT "validation_scripts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_scripts" ADD CONSTRAINT "validation_scripts_icp_profile_id_icp_profiles_id_fk" FOREIGN KEY ("icp_profile_id") REFERENCES "public"."icp_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_community_signals_idea_id" ON "community_signals" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "IDX_icp_profiles_idea_id" ON "icp_profiles" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "IDX_icp_profiles_user_id" ON "icp_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_idea_tags_idea_id" ON "idea_tags" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "IDX_idea_tags_tag_id" ON "idea_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "IDX_ideas_is_published" ON "ideas" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "IDX_ideas_created_at" ON "ideas" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_ideas_market" ON "ideas" USING btree ("market");--> statement-breakpoint
CREATE INDEX "IDX_ideas_type" ON "ideas" USING btree ("type");--> statement-breakpoint
CREATE INDEX "IDX_ideas_opportunity_score" ON "ideas" USING btree ("opportunity_score");--> statement-breakpoint
CREATE INDEX "IDX_ideas_revenue_potential_num" ON "ideas" USING btree ("revenue_potential_num");--> statement-breakpoint
CREATE INDEX "IDX_ideas_vote_count" ON "ideas" USING btree ("vote_count");--> statement-breakpoint
CREATE INDEX "IDX_ideas_save_count" ON "ideas" USING btree ("save_count");--> statement-breakpoint
CREATE INDEX "IDX_ideas_is_gregs_pick" ON "ideas" USING btree ("is_gregs_pick");--> statement-breakpoint
CREATE INDEX "IDX_ideas_created_by" ON "ideas" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "IDX_ideas_claimed_by" ON "ideas" USING btree ("claimed_by");--> statement-breakpoint
CREATE INDEX "IDX_ideas_published_created" ON "ideas" USING btree ("is_published","created_at");--> statement-breakpoint
CREATE INDEX "IDX_ideas_published_opportunity" ON "ideas" USING btree ("is_published","opportunity_score");--> statement-breakpoint
CREATE INDEX "IDX_ideas_published_vote" ON "ideas" USING btree ("is_published","vote_count");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE UNIQUE INDEX "IDX_user_idea_interactions_user_idea" ON "user_idea_interactions" USING btree ("user_id","idea_id");--> statement-breakpoint
CREATE INDEX "IDX_user_idea_ratings_user_id" ON "user_idea_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_user_idea_ratings_idea_id" ON "user_idea_ratings" USING btree ("idea_id");--> statement-breakpoint
CREATE UNIQUE INDEX "IDX_user_idea_ratings_user_idea" ON "user_idea_ratings" USING btree ("user_id","idea_id");--> statement-breakpoint
CREATE INDEX "IDX_user_idea_votes_user_id" ON "user_idea_votes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_user_idea_votes_idea_id" ON "user_idea_votes" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "IDX_user_idea_votes_user_idea" ON "user_idea_votes" USING btree ("user_id","idea_id");--> statement-breakpoint
CREATE INDEX "IDX_user_saved_ideas_user_id" ON "user_saved_ideas" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_user_saved_ideas_idea_id" ON "user_saved_ideas" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "IDX_user_saved_ideas_user_idea" ON "user_saved_ideas" USING btree ("user_id","idea_id");--> statement-breakpoint
CREATE INDEX "IDX_validation_contacts_idea_id" ON "validation_contacts" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "IDX_validation_contacts_user_id" ON "validation_contacts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_validation_contacts_icp_profile_id" ON "validation_contacts" USING btree ("icp_profile_id");--> statement-breakpoint
CREATE INDEX "IDX_validation_contacts_status" ON "validation_contacts" USING btree ("validation_status");--> statement-breakpoint
CREATE INDEX "IDX_validation_scripts_idea_id" ON "validation_scripts" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "IDX_validation_scripts_user_id" ON "validation_scripts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_validation_scripts_icp_profile_id" ON "validation_scripts" USING btree ("icp_profile_id");