import pool from "../config/configDatabase";

interface TemplateAttributes {
  attributeHeaderId: number;
  attributeBodyId: number;
  attributeFooterId: number;
  headerFontId: number;
  headerFontColourId: number;
  bodyFillColourId: number;
  bodyAlignmentId: number;
  footerFontId: number;
  footerAlignmentId: number;
  hasFrameId: number;
}

export interface TemplateData {
  attributeheaderpath: string;
  attributebodypath: string;
  attributefooterpath: string;
  headerfontpath: string;
  headerfontcolourpath: string;
  bodyfillcolourpath: string;
  bodyalignmentpath: string;
  footerfontpath: string;
  footeralignmentpath: string;
  hasframepath: string;
}

export const getRandomAttributeId = async (table: string): Promise<number> => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id FROM "Document generator".${table} ORDER BY RANDOM() LIMIT 1`
    );
    return res.rows[0].id;
  } catch (error) {
    console.error(`Error getting random attribute from ${table}:`, error);
    throw error;
  } finally {
    client.release();
  }
};

export const generateUniqueAttributes =
  async (): Promise<TemplateAttributes> => {
    const client = await pool.connect();
    try {
      let unique = false;
      let attributes: TemplateAttributes = {
        attributeHeaderId: 0,
        attributeBodyId: 0,
        attributeFooterId: 0,
        headerFontId: 0,
        headerFontColourId: 0,
        bodyFillColourId: 0,
        bodyAlignmentId: 0,
        footerFontId: 0,
        footerAlignmentId: 0,
        hasFrameId: 0,
      };

      while (!unique) {
        attributes = {
          attributeHeaderId: await getRandomAttributeId("invoice_header"),
          attributeBodyId: await getRandomAttributeId("invoice_body"),
          attributeFooterId: await getRandomAttributeId("invoice_footer"),
          headerFontId: await getRandomAttributeId("header_font"),
          headerFontColourId: await getRandomAttributeId("header_font_colour"),
          bodyFillColourId: await getRandomAttributeId("body_fill_colour"),
          bodyAlignmentId: await getRandomAttributeId("body_alignment"),
          footerFontId: await getRandomAttributeId("footer_font"),
          footerAlignmentId: await getRandomAttributeId("footer_alignment"),
          hasFrameId: await getRandomAttributeId("has_frame"),
        };

        const uniqueCheckRes = await client.query(
          `SELECT COUNT(*) FROM "Document generator".templates 
         WHERE invoice_header_id = $1 
           AND invoice_body_id = $2 
           AND invoice_footer_id = $3 
           AND header_font_id = $4 
           AND header_font_colour_id = $5 
           AND body_fill_colour_id = $6 
           AND body_alignment_id = $7 
           AND footer_font_id = $8 
           AND footer_alignment_id = $9 
           AND has_frame_id = $10`,
          [
            attributes.attributeHeaderId,
            attributes.attributeBodyId,
            attributes.attributeFooterId,
            attributes.headerFontId,
            attributes.headerFontColourId,
            attributes.bodyFillColourId,
            attributes.bodyAlignmentId,
            attributes.footerFontId,
            attributes.footerAlignmentId,
            attributes.hasFrameId,
          ]
        );

        if (parseInt(uniqueCheckRes.rows[0].count, 10) === 0) {
          unique = true;
        }
      }

      return attributes;
    } catch (error) {
      console.error("Error generating unique attributes:", error);
      throw error;
    } finally {
      client.release();
    }
  };

export const addTemplate = async (counterpartyId: number): Promise<void> => {
  const client = await pool.connect();
  try {
    const attributes = await generateUniqueAttributes();

    console.log("addTemplate", counterpartyId);
    await client.query(
      `INSERT INTO "Document generator".templates 
       (counterparty_id, invoice_header_id, invoice_body_id, invoice_footer_id, 
        header_font_id, header_font_colour_id, body_fill_colour_id, body_alignment_id, 
        footer_font_id, footer_alignment_id, has_frame_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        counterpartyId,
        attributes.attributeHeaderId,
        attributes.attributeBodyId,
        attributes.attributeFooterId,
        attributes.headerFontId,
        attributes.headerFontColourId,
        attributes.bodyFillColourId,
        attributes.bodyAlignmentId,
        attributes.footerFontId,
        attributes.footerAlignmentId,
        attributes.hasFrameId,
      ]
    );
    console.log(`Template for counterparty ID ${counterpartyId} added.`);
  } catch (error) {
    console.error("Error adding template:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getTemplateData = async (
  counterpartyId: number
): Promise<TemplateData | null> => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT 
        ah.path AS attributeheaderpath,
        ab.path AS attributebodypath,
        af.path AS attributefooterpath,
        hf.path AS headerfontpath,
        hfc.path AS headerfontcolourpath,
        bfc.path AS bodyfillcolourpath,
        ba.path AS bodyalignmentpath,
        ff.path AS footerfontpath,
        fa.path AS footeralignmentpath,
        hf2.path AS hasframepath
      FROM "Document generator".templates t
      JOIN "Document generator".invoice_header ah ON t.invoice_header_id = ah.id
      JOIN "Document generator".invoice_body ab ON t.invoice_body_id = ab.id
      JOIN "Document generator".invoice_footer af ON t.invoice_footer_id = af.id
      JOIN "Document generator".header_font hf ON t.header_font_id = hf.id
      JOIN "Document generator".header_font_colour hfc ON t.header_font_colour_id = hfc.id
      JOIN "Document generator".body_fill_colour bfc ON t.body_fill_colour_id = bfc.id
      JOIN "Document generator".body_alignment ba ON t.body_alignment_id = ba.id
      JOIN "Document generator".footer_font ff ON t.footer_font_id = ff.id
      JOIN "Document generator".footer_alignment fa ON t.footer_alignment_id = fa.id
      JOIN "Document generator".has_frame hf2 ON t.has_frame_id = hf2.id
      WHERE t.counterparty_id = $1`,
      [counterpartyId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  } catch (error) {
    console.error("Error fetching template data:", error);
    throw error;
  } finally {
    client.release();
  }
};
