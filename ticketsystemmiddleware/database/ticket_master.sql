USE [ticket_system]
GO

/****** Object:  Table [dbo].[ticket_master]    Script Date: 8/2/2025 3:40:29 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ticket_master](
	[ticket_id] [int] IDENTITY(1,1) NOT NULL,
	[ticket_subject] [nvarchar](255) NOT NULL,
	[ticket_type] [nvarchar](100) NULL,
	[ticket_status] [nvarchar](100) NULL,
	[ticket_urgencyLevel] [nvarchar](100) NULL,
	[ticket_category] [nvarchar](100) NULL,
	[ticket_SubCategory] [nvarchar](100) NULL,
	[assigned_to] [nvarchar](100) NULL,
	[assigned_group] [nvarchar](100) NULL,
	[asset_number] [nvarchar](100) NULL,
	[Attachments] [nvarchar](max) NULL,
	[Description] [nvarchar](max) NULL,
	[responded_at] [datetime] NULL,
	[resolved_at] [datetime] NULL,
	[resolved_by] [nvarchar](100) NULL,
	[created_at] [datetime] NULL,
	[created_by] [nvarchar](100) NULL,
	[ticket_for] [nvarchar](100) NULL,
	[updated_at] [datetime] NULL,
	[updated_by] [nvarchar](100) NULL,
	[is_notified] [bit] NULL,
	[is_notifiedhd] [bit] NOT NULL,
	[is_active] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ticket_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[ticket_master] ADD  DEFAULT (getdate()) FOR [created_at]
GO

ALTER TABLE [dbo].[ticket_master] ADD  DEFAULT ((0)) FOR [is_notified]
GO

ALTER TABLE [dbo].[ticket_master] ADD  DEFAULT ((0)) FOR [is_notifiedhd]
GO


