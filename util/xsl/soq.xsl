<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:fn="http://www.w3.org/2005/xpath-functions">	
	<xsl:output method="xml" indent="yes"/>
	<xsl:variable name="XML" select="/"/>
	<xsl:variable name="imagesDir">
		<xsl:value-of select="$XML/soq/imagesDir"/>
	</xsl:variable>
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
					<fo:region-body margin="28mm 0mm 0mm 0mm"></fo:region-body>
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
			<fo:page-sequence master-reference="PageMaster-Content" >
				<xsl:call-template name="showHeader"/>
				<xsl:call-template name="showFooter"/>
				<fo:flow flow-name='xsl-region-body'>
					<xsl:apply-templates select="$XML/soq/questions/question" mode="showContent" />		
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
				<fo:block width="100%" font-family="Helvetica" margin-top="10mm" space-after="10mm">					
					<fo:block text-align="center" color="#001F60" font-size="36pt"  >
						SOQ - <xsl:value-of select="$XML/soq/vendor/company" />
					</fo:block>					
				</fo:block>
				<fo:block-container font-family="Helvetica" >
					<fo:table width="100%">
						<fo:table-body>							
							<fo:table-row>
								<fo:table-cell padding="1mm">
									<fo:block text-align="left" font-size="10pt" space-before="5mm" space-after="5mm" >
										<fo:inline>Vendor Email: <xsl:value-of select="$XML/soq/vendor/email" /></fo:inline>
									</fo:block>
								</fo:table-cell>								
							</fo:table-row>
							<fo:table-row>
								<fo:table-cell padding="1mm">
									<fo:block text-align="left" font-size="10pt" space-before="5mm" space-after="5mm" >
										<fo:inline>Tax Id : <xsl:value-of select="$XML/soq/vendor/taxId" /></fo:inline>
									</fo:block>
								</fo:table-cell>								
							</fo:table-row>
							<fo:table-row>
								<fo:table-cell padding="1mm">
									<fo:block text-align="left" font-size="10pt" space-before="5mm" space-after="5mm" >
										<fo:inline>Vendor Phone Number: <xsl:value-of select="$XML/soq/vendor/phone" /></fo:inline>
									</fo:block>
								</fo:table-cell>								
							</fo:table-row>
							<xsl:if test="$XML/soq/vendor/subVendors != ''">
								<fo:table-row>
									<fo:table-cell padding="1mm">
										<fo:block text-align="left" font-size="10pt" space-before="5mm" space-after="5mm" >
											<fo:inline>Sub Vendors: <xsl:value-of select="$XML/soq/vendor/subVendors" /></fo:inline>
										</fo:block>
									</fo:table-cell>								
								</fo:table-row>
							</xsl:if>
						</fo:table-body>
					</fo:table>	
					<fo:table width="100%" space-before="10mm">
						<fo:table-body>
							<fo:table-row>
								<fo:table-cell padding="1mm">
									<fo:block text-align="left" font-size="12pt" space-before="5mm" space-after="5mm" >
										<fo:inline>RFQ Title: <xsl:value-of select="$XML/soq/rfq/title" /></fo:inline>
									</fo:block>
								</fo:table-cell>								
							</fo:table-row>
							<fo:table-row>
								<fo:table-cell padding="1mm">
									<fo:block text-align="left" font-size="12pt" space-before="5mm" space-after="5mm" >
										<fo:inline>RFQ Description: <xsl:value-of select="$XML/soq/rfq/description" /></fo:inline>
									</fo:block>
								</fo:table-cell>								
							</fo:table-row>
							<fo:table-row>
								<fo:table-cell padding="1mm">
									<fo:block text-align="left" font-size="12pt" space-before="5mm" space-after="5mm" >
										<fo:inline>Submittal Date: <xsl:value-of select="$XML/soq/rfq/submittalDate" /></fo:inline>
									</fo:block>
								</fo:table-cell>
							</fo:table-row>
							<fo:table-row>
								<fo:table-cell padding="1mm">
									<fo:block text-align="left" font-size="12pt" space-before="5mm" space-after="5mm" >
										<fo:inline>Project Type(s): <xsl:value-of select="$XML/soq/rfq/projectTypes" /></fo:inline>
									</fo:block>
								</fo:table-cell>								
							</fo:table-row>
						</fo:table-body>
					</fo:table>					
				</fo:block-container>
			</fo:flow>
		</fo:page-sequence>
	</xsl:template>
	<xsl:template mode="showContent" match="question">	
		<fo:block space-after="10mm">
			<fo:block space-after="5mm"><xsl:value-of select="./questionNo" />. <fo:inline font-weight="bold"><xsl:value-of select="./text" /> </fo:inline><xsl:text> </xsl:text><xsl:value-of select="./description" /></fo:block>	
			<xsl:apply-templates select="./answer" mode="bodyData"/>
		</fo:block>
	</xsl:template>
	<xsl:template mode="bodyData" match="node()">
		<xsl:for-each select="node()">		 	
			<xsl:if test="name()='#text'">				
				<xsl:value-of select="."/>
			</xsl:if>
			<xsl:if test="name()='strong'">
				<xsl:call-template name="showB"/>
			</xsl:if>			
			<xsl:if test="name()='i'">
				<xsl:call-template name="showI"/>
			</xsl:if>
			<xsl:if test="name()='u'">
				<xsl:call-template name="showU"/>
			</xsl:if>				
			<xsl:if test="name()='ol'">
				<xsl:call-template name="showOl"/>
			</xsl:if>
			<xsl:if test="name()='p'">
				<xsl:call-template name="showP"/>
			</xsl:if>			
			<xsl:if test="name()='ul'">
				<xsl:call-template name="showUl"/>
			</xsl:if>			
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="showP" match="p">
		<fo:block space-before="0.4em" space-after="0.8em">			
			<xsl:apply-templates select="." mode="bodyData"/>
		</fo:block>
	</xsl:template>
	<xsl:template name="showI" match="i">
		<fo:inline font-style="italic">
			<xsl:apply-templates select="." mode="bodyData"/>
		</fo:inline>
	</xsl:template>
	<xsl:template name="showU" match="u">
		<fo:inline text-decoration="underline">
			<xsl:apply-templates select="." mode="bodyData"/>
		</fo:inline>
	</xsl:template>
	<xsl:template name="showB" match="strong">
		<fo:inline font-weight="bold">
			<xsl:apply-templates select="." mode="bodyData"/>
		</fo:inline>
	</xsl:template>
	<xsl:template name="showOl" match="ol">	
		<xsl:apply-templates select="." mode="ulli"/>
	</xsl:template>	
	<xsl:template name="showUl" match="ul">		
		<xsl:apply-templates select="." mode="ulli"/>
	</xsl:template>	
	<xsl:template name="showUlLi" match="node()" mode="ulli">
		<xsl:for-each select="node()">
			<xsl:if test="name()='li'">				
				<fo:list-block space-before="0.4em" space-after="0.8em">
					<fo:list-item space-before="0.1em" space-after="0.4em" relative-align="baseline">
						<xsl:if test="name(..)='ul'">
							<xsl:attribute name="start-indent"><xsl:value-of select="count(ancestor::ul)"/>em</xsl:attribute>	
							<xsl:attribute name="provisional-distance-between-starts">1.5em</xsl:attribute>
							<xsl:attribute name="provisional-label-separation">0.95em</xsl:attribute>
						</xsl:if>
						<xsl:if test="name(..)='ol'">
							<xsl:attribute name="start-indent"><xsl:value-of select="count(ancestor::ol)"/>em</xsl:attribute>	
							<xsl:attribute name="provisional-distance-between-starts">1.5em</xsl:attribute>
							<xsl:attribute name="provisional-label-separation">0.75em</xsl:attribute>
						</xsl:if>
						<fo:list-item-label end-indent="label-end()">
							<fo:block text-align="end" >
								<!-- Check paerent node and set the bullets or numbers for list item. -->
								<xsl:if test="name(..)='ul'">
									<xsl:choose>
										<xsl:when test="count(ancestor::ul) = 1">											
											<fo:external-graphic>
												<xsl:attribute name="src">url('file:<xsl:value-of select="$imagesDir"/>/level1.svg')</xsl:attribute>
												<xsl:attribute name="content-width">scale-to-fit</xsl:attribute>
												<xsl:attribute name="content-height">scale-to-fit</xsl:attribute>
												<xsl:attribute name="width">2mm</xsl:attribute>
												<xsl:attribute name="height">2mm</xsl:attribute>
												<xsl:attribute name="scaling">uniform</xsl:attribute>
												<xsl:attribute name="vertical-align">middle</xsl:attribute>						
											</fo:external-graphic>
										</xsl:when>
										<xsl:when test="count(ancestor::ul) = 2">																			
											<fo:external-graphic>
												<xsl:attribute name="src">url('file:<xsl:value-of select="$imagesDir"/>/level2.svg')</xsl:attribute>
												<xsl:attribute name="content-width">scale-to-fit</xsl:attribute>
												<xsl:attribute name="content-height">scale-to-fit</xsl:attribute>
												<xsl:attribute name="width">2mm</xsl:attribute>
												<xsl:attribute name="height">2mm</xsl:attribute>
												<xsl:attribute name="scaling">uniform</xsl:attribute>
												<xsl:attribute name="vertical-align">middle</xsl:attribute>						
											</fo:external-graphic>
										</xsl:when>
										<xsl:otherwise>																					
											<fo:external-graphic>
												<xsl:attribute name="src">url('file:<xsl:value-of select="$imagesDir"/>/level3.svg')</xsl:attribute>
												<xsl:attribute name="content-width">scale-to-fit</xsl:attribute>
												<xsl:attribute name="content-height">scale-to-fit</xsl:attribute>
												<xsl:attribute name="width">1.5mm</xsl:attribute>
												<xsl:attribute name="height">1.5mm</xsl:attribute>
												<xsl:attribute name="scaling">uniform</xsl:attribute>
												<xsl:attribute name="vertical-align">middle</xsl:attribute>						
											</fo:external-graphic>
										</xsl:otherwise>
									</xsl:choose>									
								</xsl:if>
								<xsl:if test="name(..)='ol'">									
									<xsl:value-of select="count(preceding-sibling::li) + 1" /><xsl:text>.</xsl:text>
								</xsl:if>
							</fo:block>
						</fo:list-item-label>
						<fo:list-item-body start-indent="body-start()" text-align="left">
							<fo:block>								
								<xsl:apply-templates select="." mode="bodyData"/>
							</fo:block>
						</fo:list-item-body>
					</fo:list-item>
				</fo:list-block>
			</xsl:if>
			<xsl:if test="name()='ul'">
				<xsl:apply-templates select="." mode="ulli"/>
			</xsl:if>
			<xsl:if test="name()='ol'">
				<xsl:apply-templates select="." mode="ulli"/>
			</xsl:if>
		</xsl:for-each>
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
								<fo:block font-family="Helvetica" font-weight="bold"  text-align="center" font-size="9pt">SOQ - <xsl:value-of select="$XML/soq/vendor/company" /></fo:block>
							</fo:table-cell>						
						</fo:table-row>
						<fo:table-row>						
							<fo:table-cell text-align="center" padding-top="2.5mm">
								<fo:block font-family="Helvetica" font-weight="bold"  text-align="center" font-size="9pt">RFQ - <xsl:value-of select="$XML/soq/rfq/title" /><xsl:text> </xsl:text><xsl:value-of select="$XML/soq/rfq/description" /></fo:block>
							</fo:table-cell>						
						</fo:table-row>
					</fo:table-body>
				</fo:table>
			</fo:block-container>
		</fo:static-content>
	</xsl:template>	
</xsl:stylesheet>