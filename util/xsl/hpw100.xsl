<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:fn="http://www.w3.org/2005/xpath-functions">	
	<xsl:output method="xml" indent="yes"/>
	<xsl:variable name="XML" select="/"/>	
	<xsl:template match="/">
		<fo:root xmlns:fo='http://www.w3.org/1999/XSL/Format' xmlns:fox="http://xmlgraphics.apache.org/fop/extensions" font-family="Arial, Helvetica, sans, DejaVu Sans, Symbol">
			<fo:layout-master-set>
				<fo:simple-page-master master-name='PageMaster-Cover' page-height="279mm" page-width="216mm" margin="10mm 25mm 15mm 25mm">
					<fo:region-body></fo:region-body>					
				</fo:simple-page-master>
				<fo:simple-page-master master-name='PageMaster' page-height="279mm" page-width="216mm" margin="10mm 25mm 15mm 25mm">
					<fo:region-body margin="15mm 0mm 0mm 0mm"></fo:region-body>
					<fo:region-before region-name="header" extent="5mm" display-align="after"/>
					<fo:region-after region-name="footer" extent="5mm" display-align="before"/>
				</fo:simple-page-master>
				<fo:simple-page-master master-name='PageMaster-Content' page-height="279mm" page-width="216mm" margin="10mm 25mm 15mm 25mm">
					<fo:region-body margin="22mm 0mm 0mm 0mm"></fo:region-body>
					<fo:region-before region-name="header" extent="5mm" display-align="after"/>
					<fo:region-after region-name="footer" extent="5mm" display-align="before"/>
				</fo:simple-page-master>
				<fo:simple-page-master margin="10mm 25mm 15mm 25mm" master-name="PageMaster-TOC" page-height="279mm" page-width="216mm">
					<fo:region-body margin="15mm 0mm 0mm 0mm"/>
					<fo:region-before region-name="header" extent="5mm" display-align="after"/>
					<fo:region-after region-name="footer" extent="5mm" display-align="before"/>
				</fo:simple-page-master>
			</fo:layout-master-set>
			<xsl:call-template name="showCoverPage"/>
			<!--<xsl:call-template name="showTOF"/>-->
			<fo:page-sequence master-reference="PageMaster-Content" >
				<xsl:call-template name="showHeader"/>
				<xsl:call-template name="showFooter"/>
				<fo:flow flow-name='xsl-region-body'>
					<xsl:call-template name="showCompanyInformation"/>
					<xsl:call-template name="showAccountManager"/>	
					<xsl:call-template name="showPrincipalContactInformation"/>
					<xsl:if test="count($XML/hpw100/fullTimePersonnels/fullTimePersonnel) > 0">
						<xsl:call-template name="showFullTimePersonnel"/>		
					</xsl:if>	
					<xsl:call-template name="showAdditionalPersonnel"/>
					<xsl:call-template name="showProfessionalServiceFees"/>	
					<xsl:if test="count($XML/hpw100/workExperiences/workExperience) > 0">
						<xsl:call-template name="showWorkExperiences"/>	
					</xsl:if>	
				</fo:flow>
			</fo:page-sequence>			
												
			<fo:page-sequence master-reference="PageMaster" format="1">
				<fo:flow flow-name="xsl-region-body">
					<fo:block id="last-page" text-align="center" font-size="9pt" keep-together="always" keep-with-next="0" break-before="page">End of the Document.</fo:block>
				</fo:flow>
			</fo:page-sequence>	
	  </fo:root>
	</xsl:template>
	<xsl:template name="showCoverPage">
		<fo:page-sequence master-reference="PageMaster-Cover" force-page-count="no-force">		
			<fo:flow flow-name="xsl-region-body">
				<fo:block width="100%" font-family="Helvetica" margin-top="30mm" space-after="10mm" >					
					<fo:block text-align="center" color="#001F60" font-size="36pt"  >
						HPW 100 - <xsl:value-of select="$XML/hpw100/projectType" /> - <xsl:value-of select="$XML/hpw100/vendor" />
					</fo:block>					
				</fo:block>	
				<fo:block width="100%" font-family="Helvetica" margin-top="150mm">					
					<fo:block text-align="center">
						This HPW 100 was generated on <xsl:value-of select="$XML/hpw100/curDate" />. Some information is subject to change.
					</fo:block>					
				</fo:block>								
			</fo:flow>
		</fo:page-sequence>
	</xsl:template>
	<xsl:template name="showTOF">
		<fo:page-sequence master-reference="PageMaster-TOC" initial-page-number="1">
			<xsl:call-template name="showHeader"/>
			<xsl:call-template name="showFooter"/>
			<fo:flow flow-name="xsl-region-body">
				<fo:block-container text-align="left" font-size="12pt" font-family="Helvetica" >
					<fo:block font-weight="bold" font-size="14pt" space-before="14pt" space-after="5pt" keep-with-next.within-page="always">Table of Contents</fo:block>
					<fo:block text-align-last="justify">
						<fo:block padding="1mm">
							<fo:basic-link internal-destination="showCompanyInformation">Company Information</fo:basic-link>
							<fo:leader leader-pattern="dots"/>
							<fo:page-number-citation ref-id="showCompanyInformation"/>
						</fo:block>
						<fo:block padding="1mm">
							<fo:basic-link internal-destination="showAccountManager">Account Manager Information</fo:basic-link>
							<fo:leader leader-pattern="dots"/>
							<fo:page-number-citation ref-id="showAccountManager"/>
						</fo:block>
						<fo:block padding="1mm">
							<fo:basic-link internal-destination="showPrincipalContactInformation">Principal Contact Information</fo:basic-link>
							<fo:leader leader-pattern="dots"/>
							<fo:page-number-citation ref-id="showPrincipalContactInformation"/>
						</fo:block>
						<fo:block padding="1mm">
							<fo:basic-link internal-destination="showFullTimePersonnel">Full Time Personnel</fo:basic-link>
							<fo:leader leader-pattern="dots"/>
							<fo:page-number-citation ref-id="showFullTimePersonnel"/>
						</fo:block>
						<fo:block padding="1mm">
							<fo:basic-link internal-destination="showAdditionalPersonnel">Additional Personnel and Present Offices</fo:basic-link>
							<fo:leader leader-pattern="dots"/>
							<fo:page-number-citation ref-id="showAdditionalPersonnel"/>
						</fo:block>
						<fo:block padding="1mm">
							<fo:basic-link internal-destination="showProfessionalServiceFees">Summary of Professional Service Fees</fo:basic-link>
							<fo:leader leader-pattern="dots"/>
							<fo:page-number-citation ref-id="showProfessionalServiceFees"/>
						</fo:block>
					</fo:block>
				</fo:block-container>
			</fo:flow>
		</fo:page-sequence>
	</xsl:template>
	<xsl:template name="showCompanyInformation">		
		<fo:block-container>
			<fo:block id="showCompanyInformation" font-family="Helvetica" font-size="16pt" font-weight="bold" space-after="8mm">Company Information</fo:block>
			<fo:table width="100%" >	
				<fo:table-column column-width="40%"/>
				<fo:table-column column-width="60%"/>				
				<fo:table-body>
					<fo:table-row>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Company Phone </fo:block>
						</fo:table-cell>	
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/companyPhone" /></fo:block>
						</fo:table-cell>						
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Company Email  </fo:block>
						</fo:table-cell>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/companyEmail" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Tax Id  </fo:block>
						</fo:table-cell>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/taxId" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">DBA  </fo:block>
						</fo:table-cell>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/dba" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Business Phone Number</fo:block>
						</fo:table-cell>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/businessPhone" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">City Of Houston Supply No.  </fo:block>
						</fo:table-cell>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/vendorNo" /></fo:block>
						</fo:table-cell>								
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Business Address </fo:block>
						</fo:table-cell>	
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/businessAddress" /></fo:block>
						</fo:table-cell>						
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Mailing Address  </fo:block>
						</fo:table-cell>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/mailingAddress" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>						
					<fo:table-row>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Website  </fo:block>
						</fo:table-cell>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/website" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Is Houston Office Present?  </fo:block>
						</fo:table-cell>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/houstonOfficePresent" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<xsl:if test="$XML/hpw100/houstonOfficePresent = 'Yes'">
						<fo:table-row>
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Established in Houston  </fo:block>
							</fo:table-cell>
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/establishedInHouston" /></fo:block>
							</fo:table-cell>							
						</fo:table-row>
					</xsl:if>
					<xsl:if test="$XML/hpw100/houstonOfficePresent = 'Yes'">
						<fo:table-row>
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Houston Office is  </fo:block>
							</fo:table-cell>
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/houstonOffice" /></fo:block>
							</fo:table-cell>								
						</fo:table-row>
					</xsl:if>
					<xsl:if test="$XML/hpw100/houstonOffice = 'Subsidiary Company'">
						<fo:table-row>
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Parent Company Name  </fo:block>
							</fo:table-cell>	
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/companyParent" /></fo:block>
							</fo:table-cell>						
						</fo:table-row>
					</xsl:if>
					<xsl:if test="$XML/hpw100/houstonOffice = 'Branch/Subsidiary'">
						<fo:table-row>
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Parent Company Name  </fo:block>
							</fo:table-cell>	
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/companyParent" /></fo:block>
							</fo:table-cell>						
						</fo:table-row>
					</xsl:if>
					<xsl:if test="$XML/hpw100/houstonOfficePresent = 'Yes'">
						<fo:table-row>
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Total Personnel in Houston  </fo:block>
							</fo:table-cell>
							<fo:table-cell padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/totalHouston" /></fo:block>
							</fo:table-cell>								
						</fo:table-row>
					</xsl:if>
					<fo:table-row> 
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Total Personnel in Firm  </fo:block>
						</fo:table-cell>
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/totalPersoneelFirm" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Are you City of Houston M/W/SBE certified?  </fo:block>
						</fo:table-cell>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/cityCertified" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<xsl:if test="$XML/hpw100/cityCertified = 'Yes'">
						<fo:table-row>
							<fo:table-cell  padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">City of Houston M/W/SBE Certification No  </fo:block>
							</fo:table-cell>
							<fo:table-cell  padding="1mm">
								<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm" ><xsl:value-of select="$XML/hpw100/cityCertNo" /></fo:block>
							</fo:table-cell>							
						</fo:table-row>
					</xsl:if>
					<fo:table-row>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">TX Board of Prof. Eng. Firm Cert.#  </fo:block>
						</fo:table-cell>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/firmCertNo" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
				</fo:table-body>
			</fo:table>	
		</fo:block-container>
	</xsl:template>	
	<xsl:template name="showPrincipalContactInformation">		
		<fo:block-container keep-together.within-page="always">
			<fo:block id="showPrincipalContactInformation" font-family="Helvetica" font-size="16pt" font-weight="bold" space-before="10mm" space-after="8mm">Principal Contact Information</fo:block>
			<fo:table width="100%">
					<fo:table-column column-width="30%"/>
					<fo:table-column column-width="70%"/>
					<fo:table-body>							
						<fo:table-row>
							<fo:table-cell padding="1mm">
								<fo:block text-align="left" space-before="5mm" space-after="5mm" >
									Contact Name 
								</fo:block>
							</fo:table-cell>
							<fo:table-cell padding="1mm">
								<fo:block text-align="left" space-before="5mm" space-after="5mm" >
									<xsl:value-of select="$XML/hpw100/principalContactName" />
								</fo:block>
							</fo:table-cell>								
						</fo:table-row>
						<fo:table-row>
							<fo:table-cell padding="1mm">
								<fo:block text-align="left" space-before="5mm" space-after="5mm" >
									Title 
								</fo:block>
							</fo:table-cell>
							<fo:table-cell padding="1mm">
								<fo:block text-align="left" space-before="5mm" space-after="5mm" >
									<xsl:value-of select="$XML/hpw100/principalContactTitle" />
								</fo:block>
							</fo:table-cell>								
						</fo:table-row>
						<fo:table-row>
							<fo:table-cell padding="1mm">
								<fo:block text-align="left" space-before="5mm" space-after="5mm" >
									Email 
								</fo:block>
							</fo:table-cell>
							<fo:table-cell padding="1mm">
								<fo:block text-align="left" space-before="5mm" space-after="5mm" >
									<xsl:value-of select="$XML/hpw100/principalContactEmail" />
								</fo:block>
							</fo:table-cell>								
						</fo:table-row>	
						<fo:table-row>
							<fo:table-cell padding="1mm">
								<fo:block text-align="left" space-before="5mm" space-after="5mm" >
									Phone Number
								</fo:block>
							</fo:table-cell>
							<fo:table-cell padding="1mm">
								<fo:block text-align="left" space-before="5mm" space-after="5mm" >
									<xsl:value-of select="$XML/hpw100/principalContactPhone" />
								</fo:block>
							</fo:table-cell>									
						</fo:table-row>							
					</fo:table-body>
				</fo:table>	
		</fo:block-container>
	</xsl:template>
	<xsl:template name="showAccountManager">		
		<fo:block-container keep-together.within-page="always">
			<fo:block id="showAccountManager" font-family="Helvetica" font-size="16pt" font-weight="bold" space-before="10mm" space-after="8mm">Account Manager Information</fo:block>
			<fo:table width="100%">		
				<fo:table-column column-width="35%"/>
				<fo:table-column column-width="65%"/>			
				<fo:table-body>
					<fo:table-row>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Account Manager Name  </fo:block>
						</fo:table-cell>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/accountManagerName" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<fo:table-row>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Account Manager Phone  </fo:block>
						</fo:table-cell>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/accountManagerPhone" /></fo:block>
						</fo:table-cell>							
					</fo:table-row>
					<fo:table-row  >
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Account Manager Email  </fo:block>
						</fo:table-cell>	
						<fo:table-cell padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="$XML/hpw100/accountManagerEmail" /></fo:block>
						</fo:table-cell>						
					</fo:table-row>						
				</fo:table-body>
			</fo:table>	
		</fo:block-container>
	</xsl:template>
	<xsl:template name="showWorkExperiences">
		<fo:block-container>
			<fo:block id="showWorkExperiences" font-family="Helvetica" font-size="16pt" font-weight="bold" space-before="10mm" space-after="8mm">Work Experience</fo:block>					
			<xsl:apply-templates select="$XML/hpw100/workExperiences/workExperience" mode="showWorkExp" />
		</fo:block-container>		
	</xsl:template>
	<xsl:template mode="showWorkExp" match="workExperience">
		<fo:table width="100%" space-after="10mm">
			<fo:table-column column-width="40%"/>
			<fo:table-column column-width="60%"/>					
			<fo:table-body>
				<fo:table-row>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Project Name
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							<xsl:value-of select="./projectName" />
						</fo:block>
					</fo:table-cell>
				</fo:table-row>
				<fo:table-row>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Location 
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							<xsl:value-of select="./location" />
						</fo:block>
					</fo:table-cell>
				</fo:table-row>
				<fo:table-row>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Nature of Responsibility 
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							<xsl:value-of select="./responsibilityNature" />
						</fo:block>
					</fo:table-cell>
				</fo:table-row>
				<fo:table-row>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Project Address 
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							<xsl:value-of select="./ownerAddress" />
						</fo:block>
					</fo:table-cell>							
				</fo:table-row>
				<fo:table-row>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Project Owner's Name 
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							<xsl:value-of select="./projectOwner" />
						</fo:block>
					</fo:table-cell>							
				</fo:table-row>
				<fo:table-row>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Phone Number 
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							<xsl:value-of select="./contactPersonPhone" />
						</fo:block>
					</fo:table-cell>							
				</fo:table-row>
				<xsl:if test="./contactPerson != ''">
					<fo:table-row>
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
								Contact Person's Name 
							</fo:block>
						</fo:table-cell>	
						<fo:table-cell  padding="1mm">
							<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
								<xsl:value-of select="./contactPerson" />
							</fo:block>
						</fo:table-cell>						
					</fo:table-row>
				</xsl:if>
				<fo:table-row>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Company Type 
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							<xsl:value-of select="./companyType" />
						</fo:block>
					</fo:table-cell>	
				</fo:table-row>
				<fo:table-row>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Start Date 
						</fo:block>
					</fo:table-cell>	
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							<xsl:value-of select="./startDate" />
						</fo:block>
					</fo:table-cell>						
				</fo:table-row>				
				<fo:table-row>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Completion Date 
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							<xsl:value-of select="./completionDate" />
						</fo:block>
					</fo:table-cell>								
				</fo:table-row>				
				<fo:table-row >
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							Construction Cost 
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
							$<xsl:value-of select="./cost" />
						</fo:block>
					</fo:table-cell>								
				</fo:table-row>
				<fo:table-row >
					<fo:table-cell  padding="1mm" border-bottom-style="solid" border-right-width="0.5mm" border-right-color="black">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">							
						</fo:block>
					</fo:table-cell>
					<fo:table-cell  padding="1mm" border-bottom-style="solid" border-right-width="0.5mm" border-right-color="black">
						<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">							
						</fo:block>
					</fo:table-cell>								
				</fo:table-row>
			</fo:table-body>
		</fo:table>
	</xsl:template>
	<xsl:template name="showProfessionalServiceFees">		
		<fo:block-container keep-together.within-page="always">
			<fo:block id="showProfessionalServiceFees" font-family="Helvetica" font-size="16pt" font-weight="bold" space-before="10mm" space-after="10mm">Summary of Professional Service Fees</fo:block>
			<fo:table width="100%">	
					<fo:table-column column-width="25%"/>
					<fo:table-column column-width="25%"/>	
					<fo:table-column column-width="25%"/>
					<fo:table-column column-width="25%"/>					
					<fo:table-header>
						<fo:table-row>
							<fo:table-cell  padding="2mm" wrap-option="wrap">
								<fo:block font-family="Helvetica" font-weight="bold" space-before="5mm" space-after="5mm">Year</fo:block>
							</fo:table-cell>
							<fo:table-cell  padding="2mm" wrap-option="wrap">
								<fo:block wrap-option="wrap" font-family="Helvetica" font-weight="bold" space-before="5mm" space-after="5mm">Direct City of Houston Contract Work</fo:block>
							</fo:table-cell>
							<fo:table-cell  padding="2mm" wrap-option="wrap">
								<fo:block wrap-option="wrap" font-family="Helvetica" font-weight="bold" space-before="5mm" space-after="5mm">Total Fees of Houston Office</fo:block>
							</fo:table-cell>
							<fo:table-cell  padding="2mm" wrap-option="wrap">
								<fo:block wrap-option="wrap" font-family="Helvetica" font-weight="bold" space-before="5mm" space-after="5mm">Total Fees of Firm</fo:block>
							</fo:table-cell>							
						</fo:table-row>
					</fo:table-header>			
					<fo:table-body>
						<xsl:apply-templates select="$XML/hpw100/serviceFees/serviceFee" mode="showServiceFees" />
					</fo:table-body>
			</fo:table>
		</fo:block-container> 
	</xsl:template>
	<xsl:template mode="showServiceFees" match="serviceFee">
		<fo:table-row>
			<fo:table-cell  padding="1mm" wrap-option="wrap">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
					<xsl:value-of select="./year" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell  padding="1mm" wrap-option="wrap">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
					<xsl:value-of select="./contract" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell  padding="1mm" wrap-option="wrap">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
					<xsl:value-of select="./total" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell  padding="1mm" wrap-option="wrap">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">
					<xsl:value-of select="./contractFirm" />
				</fo:block>
			</fo:table-cell>							
		</fo:table-row>
	</xsl:template>
	<xsl:template name="showAdditionalPersonnel">		
		<fo:block-container keep-together.within-page="always">				
			<fo:block id="showAdditionalPersonnel" font-family="Helvetica" font-size="16pt" font-weight="bold" space-before="10mm" space-after="3mm">Additional Personnel and Present Offices</fo:block>
			<xsl:if test="not($XML/hpw100/additionalPersonnel/disciplineTitle1 = '') or not($XML/hpw100/additionalPersonnel/disciplineTitle2 = '') or not($XML/hpw100/additionalPersonnel/disciplineTitle3 = '') or not($XML/hpw100/additionalPersonnel/disciplineTitle4 = '')">
				<fo:block font-family="Helvetica" wrap-option="wrap" font-size="13pt" font-weight="bold" space-after="10mm">Additional Full Time Personnel by Discipline (Presently Located in the Houston Office)</fo:block>
				<fo:table width="100%">	
					<fo:table-column column-width="50%"/>
					<fo:table-column column-width="50%"/>				
					<fo:table-body>						
						<xsl:if test="$XML/hpw100/additionalPersonnel/disciplineTitle1 != ''">
							<fo:table-row>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Discipline Title 1: <xsl:value-of select="$XML/hpw100/additionalPersonnel/disciplineTitle1" /></fo:block>
								</fo:table-cell>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Count: <xsl:value-of select="$XML/hpw100/additionalPersonnel/disciplineCount1" /></fo:block>
								</fo:table-cell>							
							</fo:table-row>
						</xsl:if>
						<xsl:if test="$XML/hpw100/additionalPersonnel/disciplineTitle2 != ''">
							<fo:table-row>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Discipline Title 2: <xsl:value-of select="$XML/hpw100/additionalPersonnel/disciplineTitle2" /></fo:block>
								</fo:table-cell>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Count: <xsl:value-of select="$XML/hpw100/additionalPersonnel/disciplineCount2" /></fo:block>
								</fo:table-cell>							
							</fo:table-row>
						</xsl:if>						
						<xsl:if test="$XML/hpw100/additionalPersonnel/disciplineTitle3 != ''">
							<fo:table-row>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Discipline Title 3: <xsl:value-of select="$XML/hpw100/additionalPersonnel/disciplineTitle3" /></fo:block>
								</fo:table-cell>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Count: <xsl:value-of select="$XML/hpw100/additionalPersonnel/disciplineCount3" /></fo:block>
								</fo:table-cell>							
							</fo:table-row>
						</xsl:if>						
						<xsl:if test="$XML/hpw100/additionalPersonnel/disciplineTitle4 != ''">
							<fo:table-row>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Discipline Title 4: <xsl:value-of select="$XML/hpw100/additionalPersonnel/disciplineTitle4" /></fo:block>
								</fo:table-cell>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm">Count: <xsl:value-of select="$XML/hpw100/additionalPersonnel/disciplineCount4" /></fo:block>
								</fo:table-cell>							
							</fo:table-row>		
						</xsl:if>					
					</fo:table-body>
				</fo:table>	
			</xsl:if>
			<xsl:if test="count($XML/hpw100/presentOffices/office) > 0">
				<fo:block-container keep-together.within-page="always">
					<fo:block font-family="Helvetica" font-size="16pt" font-weight="bold" space-before="10mm" space-after="5mm">Present Offices</fo:block>
					<fo:table width="100%">	
						<fo:table-column column-width="25%"/>
						<fo:table-column column-width="25%"/>	
						<fo:table-column column-width="25%"/>
						<fo:table-column column-width="25%"/>					
						<fo:table-header>
							<fo:table-row>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" font-weight="bold" space-before="5mm" space-after="5mm">City</fo:block>
								</fo:table-cell>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" font-weight="bold" space-before="5mm" space-after="5mm">State</fo:block>
								</fo:table-cell>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" font-weight="bold" space-before="5mm" space-after="5mm">Phone</fo:block>
								</fo:table-cell>
								<fo:table-cell  padding="1mm">
									<fo:block font-family="Helvetica" font-weight="bold" space-before="5mm" space-after="5mm">Personnel by Office</fo:block>
								</fo:table-cell>							
							</fo:table-row>
						</fo:table-header>			
						<fo:table-body>
							<xsl:apply-templates select="$XML/hpw100/presentOffices/office" mode="showPresentOffice" />
						</fo:table-body>
					</fo:table>
				</fo:block-container>
			</xsl:if>
		</fo:block-container>
	</xsl:template>
	<xsl:template mode="showPresentOffice" match="office">   	
    	<fo:table-row>
			<fo:table-cell  padding="1mm">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="./city" /></fo:block>
			</fo:table-cell>
			<fo:table-cell  padding="1mm">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="./state" /></fo:block>
			</fo:table-cell>
			<fo:table-cell  padding="1mm">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="./phone" /></fo:block>
			</fo:table-cell>
			<fo:table-cell  padding="1mm">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="./personnelByOffice" /></fo:block>
			</fo:table-cell>
		</fo:table-row>    	
	</xsl:template>
	<xsl:template mode="showFullTimePersonnelItem" match="fullTimePersonnel">   	
    	<fo:table-row>
			<fo:table-cell  padding="1mm">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="./title" /></fo:block>
			</fo:table-cell>
			<fo:table-cell  padding="1mm">
				<fo:block font-family="Helvetica" space-before="5mm" space-after="5mm"><xsl:value-of select="./count" /></fo:block>
			</fo:table-cell>			
		</fo:table-row>    	
	</xsl:template>
	<xsl:template name="showFullTimePersonnel">		
		<fo:block-container keep-together.within-page="always">
			<fo:block id="showFullTimePersonnel" font-family="Helvetica" font-size="16pt" font-weight="bold" space-before="10mm" space-after="2mm">Full Time Personnel</fo:block>
			<fo:block font-family="Helvetica" wrap-option="wrap" font-size="13pt" font-weight="bold" space-after="10mm">Full Time Personnel by Discipline (Presently Located in the Houston Office)</fo:block>
			<xsl:if test="count($XML/hpw100/fullTimePersonnels/fullTimePersonnel) > 0">
				<fo:table width="100%">					
					<fo:table-body>
						<xsl:apply-templates select="$XML/hpw100/fullTimePersonnels/fullTimePersonnel" mode="showFullTimePersonnelItem" />							
					</fo:table-body>
				</fo:table>	
			</xsl:if>
		</fo:block-container> 
	</xsl:template>
	<xsl:template name="showFooter">
		<fo:static-content flow-name="footer">
			<fo:block-container font-size="8pt" font-weight="bold">
				<fo:block font-family="Helvetica"  text-align="right" padding-top="10mm">
					Page
					<fo:page-number/>
					of
					<fo:page-number-citation ref-id="last-page"/>
				</fo:block>
			</fo:block-container>
		</fo:static-content>
	</xsl:template>
	<xsl:template name="showHeader">
		<fo:static-content flow-name="header">
			<fo:block-container>
				<fo:table>
					<fo:table-body>
						<fo:table-row>						
							<fo:table-cell text-align="center" padding-top="2.5mm">
								<fo:block font-family="Helvetica" font-weight="bold"  text-align="center" font-size="9pt">HPW 100 - <xsl:value-of select="$XML/hpw100/projectType" /> - <xsl:value-of select="$XML/hpw100/vendor" /></fo:block>
							</fo:table-cell>						
						</fo:table-row>						
					</fo:table-body>
				</fo:table>
			</fo:block-container>
		</fo:static-content>
	</xsl:template>	
</xsl:stylesheet>